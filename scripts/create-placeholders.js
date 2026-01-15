const fs = require('fs');
const path = require('path');

// Minimal valid 1x1 transparent PNG (base64)
const transparentPng = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
);

// Simple colored square PNG generator (creates a basic colored image)
function createColoredPng(width, height, r, g, b) {
  // PNG signature
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // For simplicity, we'll use the transparent PNG as placeholder
  // In production, you'd want to generate proper sized images
  return transparentPng;
}

const assetsDir = path.join(__dirname, '..', 'assets');

// Ensure assets directory exists
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Create placeholder files
const placeholders = [
  'icon.png',
  'splash-icon.png',
  'adaptive-icon.png',
  'favicon.png'
];

placeholders.forEach(filename => {
  const filepath = path.join(assetsDir, filename);
  fs.writeFileSync(filepath, transparentPng);
  console.log(`Created: ${filename}`);
});

console.log('\nPlaceholder assets created!');
console.log('Replace these with your actual app icons before publishing.');
