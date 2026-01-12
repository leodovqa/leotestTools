// tools/fetch_icons.js
// Fetch pal icons from Game8 listing and save to assets/pals_icons/
// - Skips existing files by default
// - Writes assets/pals_icons/manifest.json mapping palNum -> { filename, url }
// Usage: node tools/fetch_icons.js

const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const ROOT = path.resolve(__dirname, '..');
const ASSETS_DIR = path.join(ROOT, 'assets', 'pals_icons');
const PALS_JSON = path.join(ROOT, 'pals.json');
const MANIFEST_FILE = path.join(ASSETS_DIR, 'manifest.json');

const GAME8_LISTING_URL = 'https://game8.co/games/Palworld/archives/439556';

function sanitizeName(name) {
  return name.replace(/[^a-z0-9\-_]/gi, '_').replace(/_+/g, '_');
}

function zeroPad(numStr, len = 3) {
  if (!/^\d+$/.test(numStr)) return numStr;
  return numStr.padStart(len, '0');
}

(async function main() {
  console.log('Loading pals from', PALS_JSON);
  if (!fs.existsSync(PALS_JSON)) {
    console.error('pals.json not found. Run parse_pals.js first.');
    process.exit(1);
  }

  const pals = JSON.parse(fs.readFileSync(PALS_JSON, 'utf8'));
  if (!Array.isArray(pals) || pals.length === 0) {
    console.error('pals.json is empty or malformed');
    process.exit(1);
  }

  if (!fs.existsSync(ASSETS_DIR)) fs.mkdirSync(ASSETS_DIR, { recursive: true });

  console.log('Fetching Game8 listing page to find icon URLs...');
  const listingResp = await fetch(GAME8_LISTING_URL, { redirect: 'follow' });
  if (!listingResp.ok) {
    console.error('Failed to fetch listing page:', listingResp.status, listingResp.statusText);
    process.exit(1);
  }
  const html = await listingResp.text();

  // Find all <img ... alt="SomeName" src="..."> occurrences
  const imgRegex = /<img[^>]*alt=["']([^"']+)["'][^>]*src=["']([^"']+)["'][^>]*>/gi;
  const mapAltToSrc = new Map();
  let m;
  while ((m = imgRegex.exec(html)) !== null) {
    const alt = m[1].trim();
    const src = m[2].trim();
    // store first occurrence; prefer https URLs
    if (!mapAltToSrc.has(alt)) mapAltToSrc.set(alt, src);
  }

  console.log('Found', mapAltToSrc.size, 'images with alt tags on the listing page.');

  const manifest = fs.existsSync(MANIFEST_FILE) ? JSON.parse(fs.readFileSync(MANIFEST_FILE, 'utf8')) : {};

  let downloaded = 0;
  let skipped = 0;
  let missing = 0;

  for (const pal of pals) {
    const palNum = String(pal.palNum || pal.palNum === 0 ? pal.palNum : pal.num);
    const palName = pal.palName || pal.name || '';
    const palNameLower = palName.toLowerCase();

    // Find a matching alt key
    let foundEntry = null;
    for (const [alt, src] of mapAltToSrc.entries()) {
      const altLower = alt.toLowerCase();
      if (altLower === palNameLower || altLower.includes(palNameLower) || palNameLower.includes(altLower)) {
        foundEntry = { alt, src };
        break;
      }
    }

    if (!foundEntry) {
      // try a looser match: alt contains first word of palName
      const firstWord = palNameLower.split(/[\s\-()]+/)[0];
      for (const [alt, src] of mapAltToSrc.entries()) {
        if (alt.toLowerCase().includes(firstWord)) {
          foundEntry = { alt, src };
          break;
        }
      }
    }

    if (!foundEntry) {
      // no image found for this pal on the listing page
      missing++;
      console.warn(`No image found for ${palNum} ${palName}`);
      continue;
    }

    const urlStr = foundEntry.src;
    // normalize relative URLs
    let iconUrl;
    try {
      iconUrl = new URL(urlStr, GAME8_LISTING_URL).toString();
    } catch (err) {
      console.warn('Invalid URL for', palName, urlStr);
      missing++;
      continue;
    }

    const ext = path.extname(new URL(iconUrl).pathname).split('?')[0] || '.png';
    const filename = `${zeroPad(palNum)}_${sanitizeName(palName)}${ext}`;
    const outPath = path.join(ASSETS_DIR, filename);

    if (fs.existsSync(outPath)) {
      skipped++;
      manifest[palNum] = { filename, url: iconUrl, sourceAlt: foundEntry.alt };
      continue;
    }

    try {
      const resp = await fetch(iconUrl, { redirect: 'follow' });
      if (!resp.ok) {
        console.warn(`Failed to download ${iconUrl} for ${palNum} ${palName}: ${resp.status}`);
        missing++;
        continue;
      }
      const buffer = Buffer.from(await resp.arrayBuffer());
      fs.writeFileSync(outPath, buffer);
      manifest[palNum] = { filename, url: iconUrl, sourceAlt: foundEntry.alt };
      downloaded++;
      console.log(`Saved ${filename}`);
    } catch (err) {
      console.warn('Error downloading', iconUrl, err.message);
      missing++;
    }
  }

  fs.writeFileSync(MANIFEST_FILE, JSON.stringify(manifest, null, 2), 'utf8');

  console.log('\nDone.');
  console.log('Downloaded:', downloaded);
  console.log('Skipped (already existed):', skipped);
  console.log('Missing / failed:', missing);
})();
