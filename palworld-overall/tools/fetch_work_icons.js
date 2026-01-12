// tools/fetch_work_icons.js
// Fetch work-suitability icons from Game8 listing page and save to assets/work_icons/
// - Skips existing files by default
// - Writes assets/work_icons/manifest.json mapping workType -> { filename, url }
// Usage: node tools/fetch_work_icons.js

const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const ROOT = path.resolve(__dirname, '..');
const ASSETS_DIR = path.join(ROOT, 'assets', 'work_icons');
const PALS_RAW = path.join(ROOT, 'pals_raw.json');
const MANIFEST_FILE = path.join(ASSETS_DIR, 'manifest.json');
const GAME8_LISTING_URL = 'https://game8.co/games/Palworld/archives/439556';

function sanitizeFile(name){
  return name.replace(/[^a-z0-9\-_]/gi, '_').replace(/_+/g,'_');
}

(async function main(){
  if (!fs.existsSync(PALS_RAW)){
    console.error('pals_raw.json not found. Run parse_pals.js first.');
    process.exit(1);
  }
  const raw = JSON.parse(fs.readFileSync(PALS_RAW,'utf8'));
  const workSet = new Set();
  raw.forEach(r => {
    if (Array.isArray(r.workSuitability)) {
      r.workSuitability.forEach(w => { if (w && w.type) workSet.add(w.type.trim()); });
    }
  });
  const works = Array.from(workSet).sort();
  console.log('Found', works.length, 'unique work types.');

  if (!fs.existsSync(ASSETS_DIR)) fs.mkdirSync(ASSETS_DIR, { recursive: true });
  const manifest = fs.existsSync(MANIFEST_FILE) ? JSON.parse(fs.readFileSync(MANIFEST_FILE,'utf8')) : {};

  console.log('Fetching Game8 listing page to find icon URLs...');
  const resp = await fetch(GAME8_LISTING_URL, { redirect: 'follow' });
  if (!resp.ok) { console.error('Failed to fetch listing page:', resp.status); process.exit(1); }
  const html = await resp.text();

  // collect all img alt->src
  const imgRegex = /<img[^>]*alt=["']([^"']+)["'][^>]*src=["']([^"']+)["'][^>]*>/gi;
  const map = new Map();
  let m;
  while ((m = imgRegex.exec(html)) !== null) {
    const alt = m[1].trim();
    const src = m[2].trim();
    if (!map.has(alt)) map.set(alt, src);
  }

  let downloaded=0, skipped=0, missing=0;
  for(const work of works){
    // try to find an img alt that contains the work name
    const lower = work.toLowerCase();
    let found = null;
    for(const [alt, src] of map.entries()){
      const altLower = alt.toLowerCase();
      // Some alts look like "Palworld - Lumbering Diamond Icon Lumbering"
      if (altLower.includes(lower) && (altLower.includes('icon') || altLower.includes('diamond') || altLower.includes('image') || altLower.includes('icon'))) {
        found = { alt, src };
        break;
      }
    }
    if (!found) {
      // try looser match: alt contains first word
      const first = lower.split(/\s|\-/)[0];
      for(const [alt, src] of map.entries()){
        if (alt.toLowerCase().includes(first) && (alt.toLowerCase().includes('icon') || alt.toLowerCase().includes('diamond'))) { found = {alt, src}; break; }
      }
    }

    if (!found) {
      console.warn('No icon found for work type:', work);
      missing++;
      continue;
    }

    const urlStr = found.src;
    let iconUrl;
    try { iconUrl = new URL(urlStr, GAME8_LISTING_URL).toString(); }
    catch(e){ console.warn('Bad URL for', work, urlStr); missing++; continue; }

    const ext = path.extname(new URL(iconUrl).pathname).split('?')[0] || '.png';
    const filename = sanitizeFile(work) + ext;
    const outPath = path.join(ASSETS_DIR, filename);

    if (fs.existsSync(outPath)) { skipped++; manifest[work] = { filename, url: iconUrl, sourceAlt: found.alt }; continue; }

    try {
      const r = await fetch(iconUrl, { redirect: 'follow' });
      if (!r.ok) { console.warn('Failed to download', iconUrl); missing++; continue; }
      const buffer = Buffer.from(await r.arrayBuffer());
      fs.writeFileSync(outPath, buffer);
      manifest[work] = { filename, url: iconUrl, sourceAlt: found.alt };
      downloaded++; console.log('Saved', filename);
    } catch (err) { console.warn('Error downloading', iconUrl, err.message); missing++; }
  }

  fs.writeFileSync(MANIFEST_FILE, JSON.stringify(manifest,null,2),'utf8');
  console.log('\nDone.');
  console.log('Downloaded:', downloaded, 'Skipped:', skipped, 'Missing:', missing);
})();
