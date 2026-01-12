const https = require('https');
const fs = require('fs');
const path = require('path');

const iconUrl = 'https://images.game8.co/image/palworld-wiki/Palworld.png';
const outputDir = path.join(__dirname, '..', 'assets');
const outputPath = path.join(outputDir, 'palworld_icon.png');

// Ensure assets directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Download the icon
https.get(iconUrl, (response) => {
  if (response.statusCode === 200) {
    const fileStream = fs.createWriteStream(outputPath);
    response.pipe(fileStream);
    fileStream.on('finish', () => {
      fileStream.close();
      console.log(`✓ Downloaded Palworld icon to ${outputPath}`);
    });
    fileStream.on('error', (err) => {
      fs.unlink(outputPath, () => {}); // Delete the file async
      console.error(`✗ Error writing file: ${err.message}`);
    });
  } else {
    console.error(`✗ Failed to download icon (status ${response.statusCode})`);
  }
}).on('error', (err) => {
  console.error(`✗ Download error: ${err.message}`);
});
