// The shared scoring scale: bands and colours used by the ring, the category
// bars and the speed card, so a 62 never looks amber in one place and red in
// another. Kept out of the component files because React Fast Refresh only
// works on a module that exports components alone.

const BANDS = [
  { min: 90, label: 'Excellent',  note: 'Very few sites score this well.' },
  { min: 75, label: 'Good',       note: 'Solid foundation with clear gaps.' },
  { min: 55, label: 'Needs work', note: 'Fixable problems are costing you traffic.' },
  { min: 35, label: 'Poor',       note: 'Significant issues holding this site back.' },
  { min: 0,  label: 'Critical',   note: 'Major problems on almost every front.' },
];

export function scoreBand(score) {
  return BANDS.find((b) => score >= b.min) || BANDS[BANDS.length - 1];
}

// Explicit hex rather than Tailwind classes: the same values feed an SVG stroke
// and an inline style, neither of which can take a class name.
export function scoreColor(score) {
  if (score >= 75) return '#16A34A';
  if (score >= 55) return '#F59E0B';
  return '#DC2626';
}
