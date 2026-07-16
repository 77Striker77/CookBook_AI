import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { parseZutaten } from '../lib/zutaten';

// Exportiert alle Rezepte inkl. geparster Zutaten als JSON — u. a. für die
// teilbare Einzeldatei-Vorschau. Nutzt denselben Parser wie die Website.
function md(s: string): string {
  return s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}

export const GET: APIRoute = async () => {
  const rezepte = await getCollection('rezepte');
  const daten = rezepte.map((r) => {
    const body = r.body ?? '';
    const zub = body.split(/##\s*Zubereitung/i)[1] ?? '';
    const zubOnly = zub.split(/##\s/)[0];
    const steps = [...zubOnly.matchAll(/^\s*\d+\.\s+(.*)$/gm)].map((m) => md(m[1].trim()));
    const notizBlock = body.split(/##\s*Notizen[^\n]*/i)[1] ?? '';
    const notes = [...notizBlock.matchAll(/^\s*-\s+(.*)$/gm)].map((m) => md(m[1].trim()));
    return {
      slug: r.id,
      titel: r.data.titel,
      kategorie: r.data.kategorie,
      küche: r.data.küche ?? null,
      tags: r.data.tags,
      portionen: r.data.portionen,
      zeit_gesamt: r.data.zeit_gesamt ?? null,
      schwierigkeit: r.data.schwierigkeit ?? null,
      bewertung: r.data.bewertung ?? null,
      quelle: r.data.quelle ?? null,
      zutaten: parseZutaten(r.data.zutaten),
      steps,
      notes,
    };
  });
  return new Response(JSON.stringify(daten), {
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
};
