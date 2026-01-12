const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, '..', 'assets');

// Ensure assets directory exists
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Create a simple Palworld-inspired SVG favicon (colorful ball icon)
const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <!-- Outer circle with gradient effect -->
  <defs>
    <radialGradient id="grad1" cx="35%" cy="35%">
      <stop offset="0%" style="stop-color:#FFD700;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#FF8C00;stop-opacity:1" />
    </radialGradient>
  </defs>
  <!-- Main circle -->
  <circle cx="16" cy="16" r="14" fill="url(#grad1)" />
  <!-- Inner highlight -->
  <circle cx="12" cy="12" r="6" fill="#FFED4E" opacity="0.6" />
  <!-- Dark ring for definition -->
  <circle cx="16" cy="16" r="14" fill="none" stroke="#333" stroke-width="1" />
</svg>`;

const faviconPath = path.join(assetsDir, 'palworld_favicon.svg');
fs.writeFileSync(faviconPath, svgContent, 'utf8');
console.log(`✓ Created Palworld favicon at ${faviconPath}`);
