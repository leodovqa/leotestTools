const https = require('https');
const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, '..', 'assets');

// Ensure assets directory exists
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Palworld Steam App ID is 1623730
// Steam CDN URL for game icon
const iconUrl = 'https://cdn.cloudflare.steamstatic.com/steam/apps/1623730/capsule_184x276.jpg';
const faviconPath = path.join(assetsDir, 'palworld_icon.jpg');

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        const fileStream = fs.createWriteStream(dest);
        response.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          console.log(`✓ Downloaded Palworld icon to ${dest}`);
          resolve();
        });
        fileStream.on('error', (err) => {
          fs.unlink(dest, () => {});
          reject(err);
        });
      } else {
        reject(new Error(`HTTP ${response.statusCode}`));
      }
    }).on('error', reject);
  });
}

downloadFile(iconUrl, faviconPath)
  .catch(err => {
    console.error(`✗ Failed to download from Steam CDN: ${err.message}`);
    console.log('Trying alternative source...');
    
    // Try alternative: Palworld Wiki or other CDN
    const altUrl = 'https://static.wikia.nocookie.net/palworld/images/c/c9/Palworld_Logo.png';
    return downloadFile(altUrl, faviconPath);
  })
  .catch(err => {
    console.error(`✗ All download attempts failed: ${err.message}`);
    console.log('Please manually provide the Palworld icon URL or download it separately.');
  });
