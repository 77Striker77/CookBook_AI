/* Bewegung — Progressive Enhancement mit `motion` (die Vanilla-Engine von
   Framer Motion, ohne React). Regeln: .claude/skills/well-seasoned/SKILL.md.

   Grundsätze, die dieses Skript einhalten MUSS:
   - Ohne JS bleibt alles sichtbar. Ausgangszustände (opacity 0) setzt erst
     dieses Skript — nie das CSS.
   - Sichtbares wird nicht angefasst: Reveals nur für Inhalt unterhalb des
     ersten Viewports.
   - 200 ms Micro, ~500 ms Auftritt, Easing cubic-bezier(.25, 0, 0, 1).
     Auftritte bewusst gemaechlich (Buch, keine App); nur die Reaktion auf
     Beruehrung bleibt schnell, sonst fuehlt sie sich kaputt an.
   - prefers-reduced-motion beendet alles hier, und im Kochmodus ruht es. */
import { animate, inView, press, stagger } from 'motion';

const EASE: [number, number, number, number] = [0.25, 0, 0, 1];
const MICRO = 0.2;
const REVEAL = 0.5;

if (
  !matchMedia('(prefers-reduced-motion: reduce)').matches &&
  !document.querySelector('.kochen')
) {
  heldAuftritt();
  kartenReveal();
  tastendruck();
  zahlenPuls();
}

/* Startseite: Titelblock und Bildwand treten nacheinander auf —
   einmal pro Seitenaufruf, wie eine aufgeschlagene Buchseite. */
function heldAuftritt() {
  const text = document.querySelectorAll<HTMLElement>('.held-text > *');
  const bilder = document.querySelectorAll<HTMLElement>('.held-bilder .hb');
  if (text.length) {
    animate(
      text,
      { opacity: [0, 1], y: [14, 0] },
      { duration: REVEAL, ease: EASE, delay: stagger(0.1) },
    );
  }
  if (bilder.length) {
    animate(
      bilder,
      { opacity: [0, 1], scale: [0.97, 1] },
      { duration: REVEAL, ease: EASE, delay: stagger(0.09, { startDelay: 0.2 }) },
    );
  }
}

/* Rezeptkarten unterhalb der Falz steigen beim Hereinscrollen auf.
   Karten im ersten Viewport und ausgefilterte (hidden) bleiben unberührt,
   und jede Karte animiert höchstens einmal. */
function kartenReveal() {
  const karten = document.querySelectorAll<HTMLElement>('.liste .rk, .raster-3 .rk');
  karten.forEach((karte, i) => {
    if (karte.getBoundingClientRect().top < innerHeight * 0.9) return;
    karte.style.opacity = '0';
    const stop = inView(
      karte,
      () => {
        animate(
          karte,
          { opacity: [0, 1], y: [18, 0] },
          { duration: REVEAL, ease: EASE, delay: (i % 3) * 0.08 },
        );
        stop();
      },
      { margin: '0px 0px -10% 0px' },
    );
  });
}

/* Taktile Quittung für die kleinen quadratischen Bedienelemente — eine
   Feder statt Hover, denn in der Küche gibt es keinen Mauszeiger. */
function tastendruck() {
  press(
    '.rk-plan, .theme-toggle, .stepper button, .pz-stepper button, .eg-stepper button',
    (el) => {
      animate(el, { scale: 0.92 }, { type: 'spring', stiffness: 550, damping: 30 });
      return () => animate(el, { scale: 1 }, { type: 'spring', stiffness: 300, damping: 20 });
    },
  );
}

/* Ändert sich der Kochplan, pulsieren die Zähler (Badge in der Kopfzeile,
   Zahl im Einkaufs-Band) — die sichtbare Quittung der Aktion. */
function zahlenPuls() {
  let letzte = (window as any).WSPlan?.count?.() ?? 0;
  window.addEventListener('ws-plan-change', () => {
    const n = (window as any).WSPlan?.count?.() ?? 0;
    if (n === letzte) return;
    letzte = n;
    for (const sel of ['#planBadge', '#dashPlan']) {
      const el = document.querySelector<HTMLElement>(sel);
      if (el && !el.hidden) {
        animate(el, { scale: [1, 1.3, 1] }, { duration: MICRO, ease: EASE });
      }
    }
  });
}
