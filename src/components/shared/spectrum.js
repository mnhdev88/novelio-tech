// The logo's colours as a walkable list, for anything that needs "the next colour"
// by index. `fg` is the text/icon colour that passes contrast on that fill.
// `mark` is a darker tone safe for icons on white (yellow itself isn't).
export const SPECTRUM = [
  { fill: '#E02A2A', fg: '#FFFFFF', mark: '#E02A2A' },
  { fill: '#F07030', fg: '#0D246A', mark: '#D9591C' },
  { fill: '#F0A030', fg: '#0D246A', mark: '#B86E0A' },
  { fill: '#F0D030', fg: '#0D246A', mark: '#A88B00' },
  { fill: '#0A8547', fg: '#FFFFFF', mark: '#0A8547' },
  { fill: '#0E7C68', fg: '#FFFFFF', mark: '#0E7C68' },
  { fill: '#1376B4', fg: '#FFFFFF', mark: '#1376B4' },
  { fill: '#42499D', fg: '#FFFFFF', mark: '#42499D' },
  { fill: '#5E328C', fg: '#FFFFFF', mark: '#5E328C' },
];

export const spectrumAt = (i) => SPECTRUM[i % SPECTRUM.length];
