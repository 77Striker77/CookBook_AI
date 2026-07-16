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
      schwierigkeit: z.enum(['einfach', 'mittel', 'aufwendig']).optional(),
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
      bewertung: z.number().int().min(1).max(5).optional(),
      gekocht: z.array(z.coerce.date()).default([]),
      status: z.enum(['entwurf', 'geprüft']).default('entwurf'),
    }),
});

export const collections = { rezepte };
export { KATEGORIEN };
