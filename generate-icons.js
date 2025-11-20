#!/usr/bin/env node

/**
 * Icon Generator Script for PWA
 * 
 * This script helps you generate PWA icons from a source image.
 * 
 * INSTRUCTIONS:
 * 1. Install sharp: npm install sharp
 * 2. Place your logo/icon as 'icon-source.png' (1024x1024 recommended) in the project root
 * 3. Run: node generate-icons.js
 * 
 * OR use an online tool:
 * - https://www.pwabuilder.com/imageGenerator
 * - https://realfavicongenerator.net/
 * 
 * Required icon sizes for PWA:
 * - 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512
 */

const fs = require('fs');
const path = require('path');

console.log('📱 PWA Icon Generator\n');

// Check if sharp is installed
try {
  const sharp = require('sharp');
  
  const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
  const sourceImage = 'icon-source.png';
  const outputDir = 'public/icons';

  // Check if source image exists
  if (!fs.existsSync(sourceImage)) {
    console.error('❌ Source image not found: icon-source.png');
    console.log('\nPlease create a 1024x1024 PNG image named "icon-source.png" in the project root.');
    console.log('This will be used to generate all PWA icons.\n');
    process.exit(1);
  }

  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('Generating icons from:', sourceImage);
  console.log('Output directory:', outputDir);
  console.log('');

  // Generate icons
  const promises = sizes.map(size => {
    const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);
    
    return sharp(sourceImage)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile(outputPath)
      .then(() => {
        console.log(`✅ Generated: icon-${size}x${size}.png`);
      })
      .catch(err => {
        console.error(`❌ Failed to generate icon-${size}x${size}.png:`, err.message);
      });
  });

  Promise.all(promises).then(() => {
    console.log('\n🎉 All icons generated successfully!');
    console.log('\nNext steps:');
    console.log('1. Review the icons in public/icons/');
    console.log('2. Optionally create screenshots for public/screenshots/');
    console.log('3. Deploy your PWA!');
  });

} catch (error) {
  if (error.code === 'MODULE_NOT_FOUND') {
    console.log('⚠️  Sharp is not installed.\n');
    console.log('Option 1: Install sharp and run this script');
    console.log('  npm install sharp');
    console.log('  node generate-icons.js\n');
    console.log('Option 2: Use online tools to generate icons');
    console.log('  - https://www.pwabuilder.com/imageGenerator');
    console.log('  - https://realfavicongenerator.net/\n');
    console.log('Required sizes: 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512');
    console.log('Save them as: public/icons/icon-{size}x{size}.png\n');
  } else {
    console.error('Error:', error);
  }
}