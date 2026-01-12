const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '..', 'assets', 'element_icons');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const raw = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'pals_raw.json'), 'utf8'));
const elements = new Set();
raw.forEach(p => {
  if (Array.isArray(p.elements)) p.elements.forEach(e => elements.add(e));
  else if (p.elements) elements.add(String(p.elements));
});

// color map for known elements (tweakable)
const colorMap = {
  Neutral: '#9e9e9e',
  Fire: '#ff6b35',
  Water: '#3aa3ff',
  Grass: '#6bc46b',
  Electric: '#ffd86b',
  Ice: '#7fd0ff',
  Dark: '#8b5cff',
  Ground: '#c99b66',
  Dragon: '#ff8fc7'
};

const manifest = {};

function makeSvg(name, color) {
  const letter = name[0] ? name[0].toUpperCase() : '?';
  return `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">\n` +
    `  <rect width="48" height="48" rx="8" fill="${color}" />\n` +
    `  <text x="50%" y="50%" font-family="Arial, Helvetica, sans-serif" font-size="20" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">${letter}</text>\n` +
    `</svg>`;
}

elements.forEach(elem => {
  const clean = String(elem).trim();
  const fileName = clean.toLowerCase().replace(/[^a-z0-9]+/g, '_') + '.svg';
  const color = colorMap[clean] || '#555555';
  const svg = makeSvg(clean, color);
  fs.writeFileSync(path.join(outDir, fileName), svg, 'utf8');
  manifest[clean] = { filename: fileName, color };
});

fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');

console.log('Generated element icons for:', Object.keys(manifest).join(', '));
console.log('Wrote', Object.keys(manifest).length, 'svg files to', outDir);
