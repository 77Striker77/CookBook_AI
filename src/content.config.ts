import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const KATEGORIEN = [
  'hauptgericht',
  'frühstück',
  'dessert',
  'beilage',
  'suppe',
  'salat',
  'snack',
  'backen',
  'getränk',
  'grundrezept',
] as const;

const GERAETE = ['airfryer', 'ofen', 'herd', 'mixer', 'eismaschine'] as const;

// Das Schema ist der Vertrag. Fehlt ein Pflichtfeld oder ist ein Wert ungültig,
// schlägt der Build fehl und das Rezept kann nicht live gehen.
const rezepte = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './kochbuch/rezepte' }),
  schema: ({ image }) =>
    z.object({
      titel: z.string(),
      kategorie: z.enum(KATEGORIEN),
      küche: z.string().optional(),
      tags: z.array(z.string()).default([]),
      portionen: z.number().int().positive().default(2),
      zeit_aktiv: z.number().int().nonnegative().optional(),
      zeit_gesamt: z.number().int().nonnegative().optional(),
      // Geräte als geschlossene Liste, nicht als Freitext-Tag. Vorher gab es
      // drei Schreibweisen für dieselbe Fritteuse (airfryer, air-fryer,
      // heißluftfritteuse) — Freitext erodiert, ein Enum nicht.
      geraete: z.array(z.enum(GERAETE)).default([]),
      // Wann das Rezept ins Kochbuch kam. Trägt den Block "Neu im Kochbuch";
      // beim Import aus der Git-Historie nachgetragen.
      hinzugefuegt: z.coerce.date().optional(),
      // Zutaten als lesbare Liste — werden beim Build strukturiert geparst.
      zutaten: z.array(z.string()).default([]),
      quelle: z
        .object({
          typ: z.enum(['instagram', 'web', 'scan', 'eigen', 'familie']),
          url: z.string().url().optional(),
          autor: z.string().optional(),
        })
        .optional(),
      bild: image().optional(),
      // Drei Stufen statt fünf Sternen. Dass 0 von 18 Rezepten bewertet
      // waren, war die Antwort und nicht das Symptom: zwei Menschen vergeben
      // keine konsistente 1–5-Skala. Wird über /verlauf aus dem Browser
      // hierher übertragen.
      bewertung: z.enum(['nochmal', 'ok', 'nein']).optional(),
      gekocht: z.array(z.coerce.date()).default([]),
      status: z.enum(['entwurf', 'geprüft']).default('entwurf'),
    }),
});

export const collections = { rezepte };
export { KATEGORIEN, GERAETE };
