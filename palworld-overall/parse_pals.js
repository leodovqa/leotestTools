const fs = require('fs');
const palTypes = require('./pal_types');

// Element mapping - maps Palworld element icon text to standardized format
const elementMap = {
  'Palworld - Neutral Icon': 'Neutral',
  'Palworld - Fire Icon': 'Fire',
  'Palworld - Water Icon': 'Water',
  'Palworld - Grass Icon': 'Grass',
  'Palworld - Electric Icon': 'Electric',
  'Palworld - Ice Icon': 'Ice',
  'Palworld - Dark Icon': 'Dark',
  'Palworld - Ground Icon': 'Ground',
  'Palworld - Dragon Icon': 'Dragon'
};

// Use centralized passive logic module (returns both damage and mount sets)
const passiveLogic = require('./pal_passives_logic');

// Read Pal data from the tab-separated file
const palData = fs.readFileSync('pals_data.tsv', 'utf8')
  // Remove the header line
  .substring(palData.indexOf('\n') + 1);

// Parse the simplified Palworld Pal data
function getPalType(palNum) {
  // Find the pal in the types array
  return palTypes.find(p => p.number === palNum);
}

function parsePals() {
  const flatPals = [];
  const rawPals = [];
  const lines = palData.split('\n');

  lines.forEach((line) => {
    if (!line.trim()) return;

    // Split by tabs
    const parts = line.split('\t').filter(p => p.trim());
    if (parts.length < 4) return;

    // Extract Pal number and name
    const palNum = parts[0].trim();
    let palName = parts[1].trim();
    if (palName.includes('Image')) {
      palName = palName.replace(/Image.*$/, '').trim();
    }

    // Extract elements
    const elementText = parts[2];
    const elements = [];
    Object.entries(elementMap).forEach(([iconText, elementName]) => {
      if (elementText.includes(iconText) && !elements.includes(elementName)) {
        elements.push(elementName);
      }
    });

    // Parse work suitability
    const workSuitability = [];
    if (parts.length > 3) {
      const workText = parts.slice(3).join(' ');
      const simpleMatches = workText.match(/([A-Za-z]+(?:\s+[A-Za-z]+)*?)\s+Lv\.\s+(\d+)/g);
      if (simpleMatches) {
        const processed = new Set();
        simpleMatches.forEach(match => {
          const levelMatch = match.match(/(.+?)\s+Lv\.\s+(\d+)/);
          if (levelMatch) {
            let workType = levelMatch[1].trim();
            const level = levelMatch[2];
            const words = workType.match(/[A-Z][a-z]+/g) || [workType];
            if (words.length > 1 && words[0] === words[words.length - 1]) {
              workType = words[0];
            }
            const key = workType + ':' + level;
            if (!processed.has(key)) {
              processed.add(key);
              workSuitability.push({ type: workType, level: parseInt(level) });
            }
          }
        });
      }
    }

    const palType = getPalType(palNum);
    const passiveInfo = passiveLogic.getPassiveSets(palNum, elements.length > 0 ? elements[0] : 'Neutral', palType);

    const elementStr = (elements.length > 0 ? elements.join(',') : 'Neutral');
    const mountTypeStr = palType?.mountType || '';
    const primaryUse = palType?.type || 'fighter';

    // Build flat object (exact keys and order expected by the front-end table)
    // Put mountType at the end to match requested column order
    const damageSet = passiveInfo && passiveInfo.damage ? passiveInfo.damage : { best4: [], alternative: '' };
    const mountSet = passiveInfo && passiveInfo.mount ? passiveInfo.mount : null;

    const flat = {
      palNum: palNum,
      palName: palName,
      element: elementStr,
      // Attack fields show damage-oriented set for fighters and mounts
      attack1: (damageSet.best4[0] || ''),
      attack2: (damageSet.best4[1] || ''),
      attack3: (damageSet.best4[2] || ''),
      attack4: (damageSet.best4[3] || ''),
      attackAlt: (damageSet.alternative || ''),
      // Move fields show mount-oriented set if this pal is a mount
      move1: primaryUse === 'mount' && mountSet ? (mountSet.best4[0] || '') : '',
      move2: primaryUse === 'mount' && mountSet ? (mountSet.best4[1] || '') : '',
      move3: primaryUse === 'mount' && mountSet ? (mountSet.best4[2] || '') : '',
      move4: primaryUse === 'mount' && mountSet ? (mountSet.best4[3] || '') : '',
      moveAlt: primaryUse === 'mount' && mountSet ? (mountSet.alternative || '') : '',
      mountType: mountTypeStr
    };

    // Build raw object for reference (kept separate so front-end table doesn't break)
    const raw = {
      number: palNum,
      name: palName,
      elements: elements.length > 0 ? elements : ['Neutral'],
      workSuitability: workSuitability,
      type: palType?.type || 'fighter',
      mountType: palType?.mountType || null,
      passives: passiveInfo
    };

    flatPals.push(flat);
    rawPals.push(raw);
  });

  return { flatPals, rawPals };
}

// Parse and save to JSON
const { flatPals, rawPals } = parsePals();
fs.writeFileSync('pals.json', JSON.stringify(flatPals, null, 2), 'utf8');
fs.writeFileSync('pals_raw.json', JSON.stringify(rawPals, null, 2), 'utf8');

console.log(`✓ Parsed and saved ${flatPals.length} Pals to pals.json`);

// Also emit a flat CSV tailored to the sheet columns to avoid any [object Object] UI issues
function toCsvCell(v) {
  if (v === null || v === undefined) return '';
  const s = String(v);
  // Escape double quotes
  if (s.includes(',') || s.includes('\n') || s.includes('"')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

const csvHeaders = [
  'Pal #',
  'Pal Name',
  'Element',
  'Attack 1',
  'Attack 2',
  'Attack 3',
  'Attack 4',
  'Attack Alt',
  'Move 1',
  'Move 2',
  'Move 3',
  'Move 4',
  'Move Alt',
  ,
  'Mount Type'
  
];

const csvRows = [csvHeaders.join(',')];

flatPals.forEach(p => {
  const row = [
    toCsvCell(p.number),
    toCsvCell(p.name),
    toCsvCell(p.element || ''),
    toCsvCell(p.mountType || ''),
    toCsvCell(p.attack1 || ''),
    toCsvCell(p.attack2 || ''),
    toCsvCell(p.attack3 || ''),
    toCsvCell(p.attack4 || ''),
    toCsvCell(p.attackAlt || ''),
    toCsvCell(p.move1 || ''),
    toCsvCell(p.move2 || ''),
    toCsvCell(p.move3 || ''),
    toCsvCell(p.move4 || ''),
    toCsvCell(p.moveAlt || ''),
    toCsvCell(p.primaryUse || p.type || ''),
    toCsvCell(p.notes || '')
  ];

  csvRows.push(row.join(','));
});

fs.writeFileSync('pals_flat.csv', csvRows.join('\n'), 'utf8');
console.log(`✓ Wrote flat CSV with ${flatPals.length} rows to pals_flat.csv`);

