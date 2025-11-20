#!/usr/bin/env node

/**
 * PNG Icon Generator using Canvas
 * Creates proper PNG icons for PWA installation
 */

const fs = require('fs');
const path = require('path');

console.log('🎨 Creating PNG icons for PWA...\n');

// Check if canvas is available
let Canvas;
try {
  Canvas = require('canvas');
} catch (error) {
  console.log('⚠️  Canvas module not found. Installing...\n');
  console.log('Please run: npm install canvas\n');
  console.log('Or use the HTML generator instead:');
  console.log('Open create-placeholder-icons.html in your browser\n');
  process.exit(1);
}

const { createCanvas } = Canvas;

const sizes = [192, 512];
const appName = 'SRDS';
const bgColor = '#3b82f6'; // Blue
const textColor = '#ffffff'; // White

// Create icons directory
const iconsDir = path.join(__dirname, 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate PNG for each size
sizes.forEach(size => {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Draw background with rounded corners
  const radius = size * 0.1;
  ctx.fillStyle = bgColor;
  ctx.beginPath();
  ctx.moveTo(radius, 0);
  ctx.lineTo(size - radius, 0);
  ctx.quadraticCurveTo(size, 0, size, radius);
  ctx.lineTo(size, size - radius);
  ctx.quadraticCurveTo(size, size, size - radius, size);
  ctx.lineTo(radius, size);
  ctx.quadraticCurveTo(0, size, 0, size - radius);
  ctx.lineTo(0, radius);
  ctx.quadraticCurveTo(0, 0, radius, 0);
  ctx.closePath();
  ctx.fill();

  // Draw text
  const fontSize = Math.floor(size * 0.35);
  ctx.fillStyle = textColor;
  ctx.font = `bold ${fontSize}px Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(appName, size / 2, size / 2);

  // Save as PNG
  const filename = `icon-${size}x${size}.png`;
  const filepath = path.join(iconsDir, filename);
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(filepath, buffer);
  
  console.log(`✅ Created: ${filename}`);
});

console.log('\n🎉 PNG icons created successfully!');
console.log('\nNext steps:');
console.log('1. Restart your dev server: npm run dev');
console.log('2. Open: http://localhost:3000');
console.log('3. Chrome menu (⋮) → "Install SRDS"');
console.log('\nThe "Install app" option should now appear!\n');
