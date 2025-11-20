#!/usr/bin/env node

/**
 * Simple Icon Generator - No Dependencies Required
 * Creates basic SVG icons that can be used as placeholders
 */

const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const appName = 'SRDS';
const bgColor = '#3b82f6'; // Blue
const textColor = '#ffffff'; // White

console.log('🎨 Creating placeholder icons...\n');

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate SVG for each size
sizes.forEach(size => {
  const fontSize = Math.floor(size * 0.4);
  
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="${bgColor}" rx="${size * 0.1}"/>
  <text 
    x="50%" 
    y="50%" 
    font-family="Arial, sans-serif" 
    font-size="${fontSize}" 
    font-weight="bold" 
    fill="${textColor}" 
    text-anchor="middle" 
    dominant-baseline="central"
  >${appName}</text>
</svg>`;

  const filename = `icon-${size}x${size}.svg`;
  const filepath = path.join(iconsDir, filename);
  
  fs.writeFileSync(filepath, svg);
  console.log(`✅ Created: ${filename}`);
});

console.log('\n🎉 All icons created successfully!');
console.log('\nNote: These are SVG placeholders. For production, consider:');
console.log('1. Using create-placeholder-icons.html for PNG icons');
console.log('2. Creating custom icons with your logo');
console.log('3. Using a design tool like Figma or Canva\n');
