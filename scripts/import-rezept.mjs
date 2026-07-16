// Rezept-Import: liest ein GitHub-Issue (Link / Foto / Notiz), wertet die
// Quelle aus (Web-Seite inkl. Schema.org-Daten, oder Foto/Scan via Vision) und
// erzeugt mit der Claude API eine schema-konforme Rezept-Markdown-Datei plus
// (falls möglich) ein Titelbild. Läuft in GitHub Actions (siehe import.yml),
// dieselbe Logik wie der /neues-rezept-Skill.
//
// Erwartete Env: ANTHROPIC_API_KEY, GITHUB_EVENT_PATH. Optional: CLAUDE_MODEL.

import Anthropic from '@anthropic-ai/sdk';
import { readFileSync, writeFileSync, mkdirSync, appendFileSync } from 'node:fs';

const MODELL = process.env.CLAUDE_MODEL || 'claude-opus-4-8';

// ---------- 1. Issue lesen & Felder parsen ----------

const event = JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8'));
const issue = event.issue;
if (!issue) fail('Kein Issue im Event gefunden.');
const body = issue.body || '';

// Issue-Formular rendert Felder als "### Label\n\nWert".
function feld(label) {
  const re = new RegExp(`###\\s*${label.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}[^\\n]*\\n+([\\s\\S]*?)(?=\\n###\\s|$)`, 'i');
  const m = body.match(re);
  if (!m) return '';
  const v = m[1].trim();
  return v === '_No response_' || v === '_Keine Angabe_' ? '' : v;
}

const link = extractUrl(feld('Link'));
const notiz = feld('Notiz');
// Bild-URLs aus dem gesamten Body (Markdown-Bilder + GitHub-Attachments).
const bildUrls = [...new Set([
  ...[...body.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)].map((m) => m[1]),
  ...[...body.matchAll(/https:\/\/(?:user-images\.githubusercontent\.com|github\.com\/user-attachments\/assets)\/[^\s)]+/g)].map((m) => m[0]),
])].filter((u) => /^https?:\/\//.test(u));

function extractUrl(s) {
  const m = (s || '').match(/https?:\/\/[^\s)]+/);
  return m ? m[0] : '';
}

const quelleTyp = link
  ? (/instagram\.com/i.test(link) ? 'instagram' : 'web')
  : (bildUrls.length ? 'scan' : 'eigen');

console.log(`Import #${issue.number}: typ=${quelleTyp}, link=${link || '—'}, bilder=${bildUrls.length}`);

// ---------- 2. Material beschaffen ----------

async function ladeText(url) {
  try {
    const res = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0 KochbuchImporter' }, redirect: 'follow' });
    if (!res.ok) return { html: '', jsonld: null };
    const html = await res.text();
    return { html, jsonld: findeRezeptJsonLd(html) };
  } catch (e) {
    console.log('Seite konnte nicht geladen werden:', e.message);
    return { html: '', jsonld: null };
  }
}

function findeRezeptJsonLd(html) {
  for (const m of html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const daten = JSON.parse(m[1].trim());
      const kandidaten = Array.isArray(daten) ? daten : (daten['@graph'] || [daten]);
      const rezept = kandidaten.find((d) => {
        const t = d && d['@type'];
        return t === 'Recipe' || (Array.isArray(t) && t.includes('Recipe'));
      });
      if (rezept) return rezept;
    } catch { /* nächstes Script */ }
  }
  return null;
}

function textAusHtml(html) {
  const og = (re) => { const m = html.match(re); return m ? m[1] : ''; };
  const titel = og(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i);
  const beschr = og(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i);
  const roh = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return [titel, beschr, roh].filter(Boolean).join('\n').slice(0, 8000);
}

const bilder = [];
async function ladeBild(url) {
  try {
    const res = await fetch(url, { redirect: 'follow' });
    if (!res.ok) return null;
    const ct = (res.headers.get('content-type') || '').split(';')[0].trim();
    if (!/^image\/(jpeg|png|webp|gif)$/.test(ct)) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.byteLength < 1024 || buf.byteLength > 5_000_000) return null;
    return { media_type: ct, data: buf.toString('base64'), bytes: buf };
  } catch { return null; }
}

let webKontext = '';
let ogBild = '';
if (link && quelleTyp !== 'scan') {
  const { html, jsonld } = await ladeText(link);
  if (jsonld) webKontext += `\n[Strukturierte Rezeptdaten der Seite]\n${JSON.stringify(jsonld).slice(0, 8000)}\n`;
  webKontext += `\n[Seitentext]\n${textAusHtml(html)}\n`;
  const m = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
  if (m) ogBild = m[1];
}

// Vision-Bilder: hochgeladene Scans zuerst, sonst das og:image der Seite.
for (const url of [...bildUrls, ...(ogBild ? [ogBild] : [])].slice(0, 3)) {
  const b = await ladeBild(url);
  if (b) bilder.push(b);
}

// ---------- 3. Claude: Rezept strukturieren ----------

const KATEGORIEN = ['hauptgericht', 'frühstück', 'dessert', 'beilage', 'suppe', 'salat', 'snack', 'backen', 'getränk', 'grundrezept'];

const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    titel: { type: 'string' },
    kategorie: { type: 'string', enum: KATEGORIEN },
    küche: { type: ['string', 'null'] },
    tags: { type: 'array', items: { type: 'string' } },
    portionen: { type: 'integer' },
    zeit_aktiv: { type: ['integer', 'null'] },
    zeit_gesamt: { type: ['integer', 'null'] },
    schwierigkeit: { type: ['string', 'null'], enum: ['einfach', 'mittel', 'aufwendig', null] },
    zutaten: { type: 'array', items: { type: 'string' } },
    zubereitung: { type: 'array', items: { type: 'string' } },
    notizen: { type: 'array', items: { type: 'string' } },
    unklar: { type: 'array', items: { type: 'string' } },
  },
  required: ['titel', 'kategorie', 'küche', 'tags', 'portionen', 'zeit_aktiv', 'zeit_gesamt', 'schwierigkeit', 'zutaten', 'zubereitung', 'notizen', 'unklar'],
};

const SYSTEM = `Du bist ein sorgfältiger Rezept-Erfasser für ein privates Kochbuch (Sprache: Deutsch).
Extrahiere aus dem gelieferten Material ein Rezept in das vorgegebene JSON-Schema.

Regeln:
- Erfinde nichts. Fehlt eine Menge, Zeit oder ein Schritt, gib das Feld leer/null aus und vermerke es in "unklar".
- "zutaten": je Eintrag EIN lesbarer String im Format "<Menge> <Einheit> <Zutat>, <Notiz>" (Notiz optional).
  Beispiele: "400 g gehackte Tomaten, aus der Dose" · "4 Eier" · "Salz nach Geschmack".
  Eine Zwischenüberschrift als eigener Eintrag mit führendem "#": "# Für die Sauce".
- Mengen möglichst passend zu "portionen" (Standard 2, wenn nichts erkennbar).
- "kategorie" und "schwierigkeit" nur aus den erlaubten Werten.
- "zubereitung": nummerierungsfreie Klartext-Schritte, je ein String pro Schritt.
- Werte den Bild-Inhalt aktiv aus (auch Handschrift, Foto vom Ausdruck), nicht nur den Text.`;

const inhalt = [];
if (webKontext.trim()) inhalt.push({ type: 'text', text: `Quelle: ${link}\n${webKontext}` });
for (const b of bilder) inhalt.push({ type: 'image', source: { type: 'base64', media_type: b.media_type, data: b.data } });
if (notiz) inhalt.push({ type: 'text', text: `Notiz der einreichenden Person: ${notiz}` });
inhalt.push({ type: 'text', text: 'Erzeuge jetzt das Rezept-JSON. Bevorzuge strukturierte Rezeptdaten, wenn vorhanden.' });

if (!inhalt.some((b) => b.type === 'image') && !webKontext.trim() && !notiz) {
  fail('Kein auswertbares Material: weder Link-Inhalt noch Bild noch Notiz gefunden. Bitte Link prüfen oder ein Foto anhängen.');
}

if (!process.env.ANTHROPIC_API_KEY) fail('ANTHROPIC_API_KEY fehlt (als GitHub Actions Secret hinterlegen).');

const client = new Anthropic();
console.log(`Frage ${MODELL} …`);
const antwort = await client.messages.create({
  model: MODELL,
  max_tokens: 4000,
  system: SYSTEM,
  messages: [{ role: 'user', content: inhalt }],
  output_config: { format: { type: 'json_schema', schema: SCHEMA } },
});

const textBlock = antwort.content.find((b) => b.type === 'text');
if (!textBlock) fail('Keine Antwort vom Modell erhalten.');
const rezept = JSON.parse(textBlock.text);

// ---------- 4. Markdown + Bild schreiben ----------

const slug = slugify(rezept.titel);
mkdirSync(new URL('../kochbuch/rezepte/', import.meta.url), { recursive: true });
mkdirSync(new URL('../kochbuch/anhang/', import.meta.url), { recursive: true });

// Titelbild (Scan bevorzugt) ablegen, wenn vorhanden.
let bildPfad = null;
if (bilder.length) {
  const ext = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' }[bilder[0].media_type];
  const rel = `anhang/${slug}.${ext}`;
  writeFileSync(new URL(`../kochbuch/${rel}`, import.meta.url), bilder[0].bytes);
  bildPfad = rel;
}

const md = baueMarkdown(rezept, { typ: quelleTyp, url: link, notiz }, bildPfad);
const dateiRel = `kochbuch/rezepte/${slug}.md`;
writeFileSync(new URL(`../${dateiRel}`, import.meta.url), md);
console.log(`Geschrieben: ${dateiRel}`);

// Outputs für den Workflow (PR-Titel, Vorschau, Slug).
const vorschau = [
  `**${rezept.titel}** · ${rezept.kategorie}${rezept.zeit_gesamt ? ` · ${rezept.zeit_gesamt} min` : ''} · ${rezept.portionen} Portionen`,
  '',
  `${rezept.zutaten.length} Zutaten, ${rezept.zubereitung.length} Schritte.`,
  rezept.unklar?.length ? `\n⚠️ Bitte prüfen: ${rezept.unklar.join('; ')}` : '',
].join('\n');

setOutput('slug', slug);
setOutput('titel', rezept.titel);
setOutput('datei', dateiRel);
setOutput('vorschau', vorschau);

// ---------- Helfer ----------

function baueMarkdown(r, quelle, bild) {
  const y = [];
  y.push('---');
  y.push(`titel: ${yamlStr(r.titel)}`);
  y.push(`kategorie: ${r.kategorie}`);
  if (r.küche) y.push(`küche: ${yamlStr(r.küche)}`);
  y.push(`tags: [${(r.tags || []).map(yamlStr).join(', ')}]`);
  y.push(`portionen: ${r.portionen || 2}`);
  if (r.zeit_aktiv != null) y.push(`zeit_aktiv: ${r.zeit_aktiv}`);
  if (r.zeit_gesamt != null) y.push(`zeit_gesamt: ${r.zeit_gesamt}`);
  if (r.schwierigkeit) y.push(`schwierigkeit: ${r.schwierigkeit}`);
  y.push('zutaten:');
  for (const z of r.zutaten || []) y.push(`  - ${yamlStr(z)}`);
  y.push('quelle:');
  y.push(`  typ: ${quelle.typ}`);
  if (quelle.url) y.push(`  url: ${yamlStr(quelle.url)}`);
  if (bild) y.push(`bild: ${bild}`);
  y.push('gekocht: []');
  y.push('status: entwurf');
  y.push('---');
  y.push('');
  y.push('## Zubereitung');
  y.push('');
  (r.zubereitung || []).forEach((s, i) => y.push(`${i + 1}. ${s}`));
  const notizen = [...(r.notizen || [])];
  if (quelle.notiz) notizen.push(`Aus der Einreichung: ${quelle.notiz}`);
  if (r.unklar?.length) notizen.push(`Beim Import unklar: ${r.unklar.join('; ')}`);
  if (notizen.length) {
    y.push('');
    y.push('## Notizen & Varianten');
    y.push('');
    for (const n of notizen) y.push(`- ${n}`);
  }
  y.push('');
  return y.join('\n');
}

function yamlStr(s) {
  const t = String(s);
  return /[:#\[\]{}&*!|>'"%@`,]|^\s|\s$/.test(t) ? JSON.stringify(t) : t;
}

function slugify(s) {
  return String(s).toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'rezept';
}

function setOutput(key, value) {
  if (!process.env.GITHUB_OUTPUT) return;
  const delim = `EOF_${key}_${Math.abs(hash(value))}`;
  appendFileSync(process.env.GITHUB_OUTPUT, `${key}<<${delim}\n${value}\n${delim}\n`);
}
function hash(s) { let h = 0; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) | 0; return h; }

function fail(msg) {
  console.error('FEHLER:', msg);
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `fehler=${msg}\n`);
  process.exit(1);
}
