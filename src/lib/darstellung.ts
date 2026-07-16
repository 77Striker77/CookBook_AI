// Darstellungshelfer: Platzhalter-Farbverläufe (bis echte Bilder da sind),
// Kategorie-Label und Zeitformatierung.

const VERLAEUFE: Record<string, string> = {
  hauptgericht: 'linear-gradient(135deg,#C8512E,#E0A426)',
  suppe: 'linear-gradient(135deg,#B5642A,#D99A2B)',
  frühstück: 'linear-gradient(135deg,#E0A426,#8AB559)',
  dessert: 'linear-gradient(135deg,#B5548A,#E0A426)',
  beilage: 'linear-gradient(135deg,#3D7A4E,#8AB559)',
  salat: 'linear-gradient(135deg,#5AA152,#C7D34E)',
  snack: 'linear-gradient(135deg,#C8802E,#E0C026)',
  backen: 'linear-gradient(135deg,#A9662E,#E0B15C)',
  getränk: 'linear-gradient(135deg,#2E86C8,#5AC7B0)',
  grundrezept: 'linear-gradient(135deg,#6B7263,#A7B08F)',
};

export function verlauf(kategorie: string): string {
  return VERLAEUFE[kategorie] ?? VERLAEUFE.grundrezept;
}

export function katLabel(kategorie: string): string {
  return kategorie.charAt(0).toUpperCase() + kategorie.slice(1);
}

export function zeitLabel(minuten?: number): string | null {
  if (!minuten) return null;
  if (minuten < 60) return `${minuten} min`;
  const h = Math.floor(minuten / 60);
  const m = minuten % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}
