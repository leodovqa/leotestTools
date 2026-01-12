const https = require('https');
const fs = require('fs');
const path = require('path');

const iconUrl = 'https://img.game8.co/3820250/bfd9f77c798fbb2cd6a3dee41cb54924.png/show';
const assetsDir = path.join(__dirname, '..', 'assets');
const faviconPath = path.join(assetsDir, 'palworld_icon.png');

// Ensure assets directory exists
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

https.get(iconUrl, (response) => {
  if (response.statusCode === 200) {
    const fileStream = fs.createWriteStream(faviconPath);
    response.pipe(fileStream);
    fileStream.on('finish', () => {
      fileStream.close();
      console.log(`✓ Downloaded Palworld icon to assets/palworld_icon.png`);
    });
    fileStream.on('error', (err) => {
      fs.unlink(faviconPath, () => {});
      console.error(`✗ Error writing file: ${err.message}`);
    });
  } else {
    console.error(`✗ Failed to download (status ${response.statusCode})`);
  }
}).on('error', (err) => {
  console.error(`✗ Download error: ${err.message}`);
});
