#!/usr/bin/env node

/**
 * PWA Localhost Checker
 * Verifies all files are in place for PWA installation on localhost
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔍 Checking PWA Setup for Localhost...\n');

let allGood = true;

// Check 1: Manifest
console.log('1️⃣  Checking manifest.json...');
const manifestPath = path.join(__dirname, 'public', 'manifest.json');
if (fs.existsSync(manifestPath)) {
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    console.log('   ✅ Manifest exists');
    console.log(`   ✅ Name: ${manifest.name}`);
    console.log(`   ✅ Short name: ${manifest.short_name}`);
    console.log(`   ✅ Start URL: ${manifest.start_url}`);
    console.log(`   ✅ Display: ${manifest.display}`);
    console.log(`   ✅ Icons: ${manifest.icons.length} defined`);
    
    if (manifest.icons.length < 2) {
      console.log('   ⚠️  Warning: Need at least 2 icons (192x192 and 512x512)');
    }
  } catch (error) {
    console.log('   ❌ Manifest has JSON errors:', error.message);
    allGood = false;
  }
} else {
  console.log('   ❌ Manifest not found at public/manifest.json');
  allGood = false;
}

// Check 2: Service Worker
console.log('\n2️⃣  Checking service worker...');
const swPath = path.join(__dirname, 'public', 'sw.js');
if (fs.existsSync(swPath)) {
  console.log('   ✅ Service worker exists at public/sw.js');
  const swContent = fs.readFileSync(swPath, 'utf8');
  if (swContent.includes('addEventListener')) {
    console.log('   ✅ Has event listeners');
  }
  if (swContent.includes('fetch')) {
    console.log('   ✅ Has fetch handler');
  }
} else {
  console.log('   ❌ Service worker not found at public/sw.js');
  allGood = false;
}

// Check 3: Icons
console.log('\n3️⃣  Checking icons...');
const iconsDir = path.join(__dirname, 'public', 'icons');
if (fs.existsSync(iconsDir)) {
  const icons = fs.readdirSync(iconsDir);
  console.log(`   ✅ Icons directory exists with ${icons.length} files`);
  
  const requiredSizes = ['192x192', '512x512'];
  requiredSizes.forEach(size => {
    const hasIcon = icons.some(icon => icon.includes(size));
    if (hasIcon) {
      console.log(`   ✅ Has ${size} icon`);
    } else {
      console.log(`   ⚠️  Missing ${size} icon (recommended)`);
    }
  });
  
  if (icons.length === 0) {
    console.log('   ❌ No icons found in directory');
    allGood = false;
  }
} else {
  console.log('   ❌ Icons directory not found at public/icons/');
  console.log('   💡 Run: node create-icons-simple.cjs');
  allGood = false;
}

// Check 4: Offline page
console.log('\n4️⃣  Checking offline page...');
const offlinePath = path.join(__dirname, 'public', 'offline.html');
if (fs.existsSync(offlinePath)) {
  console.log('   ✅ Offline page exists');
} else {
  console.log('   ⚠️  Offline page not found (optional but recommended)');
}

// Check 5: PWA Components
console.log('\n5️⃣  Checking PWA components...');
const pwaManagerPath = path.join(__dirname, 'src', 'components', 'PWAManager.jsx');
if (fs.existsSync(pwaManagerPath)) {
  console.log('   ✅ PWAManager component exists');
} else {
  console.log('   ❌ PWAManager component not found');
  allGood = false;
}

// Check 6: Layout integration
console.log('\n6️⃣  Checking layout integration...');
const layoutPath = path.join(__dirname, 'src', 'app', 'layout.js');
if (fs.existsSync(layoutPath)) {
  const layoutContent = fs.readFileSync(layoutPath, 'utf8');
  if (layoutContent.includes('PWAManager')) {
    console.log('   ✅ PWAManager imported in layout');
  } else {
    console.log('   ⚠️  PWAManager not found in layout');
  }
  if (layoutContent.includes('manifest')) {
    console.log('   ✅ Manifest link in layout');
  } else {
    console.log('   ⚠️  Manifest link not found in layout');
  }
} else {
  console.log('   ❌ Layout file not found');
  allGood = false;
}

// Summary
console.log('\n' + '='.repeat(50));
if (allGood) {
  console.log('✅ All checks passed!');
  console.log('\n🚀 Your PWA is ready for localhost testing!');
  console.log('\nNext steps:');
  console.log('1. Run: npm run dev');
  console.log('2. Open: http://localhost:3000');
  console.log('3. Chrome menu (⋮) → "Install SRDS"');
} else {
  console.log('⚠️  Some issues found');
  console.log('\n🔧 Fix the issues above and run this check again.');
}
console.log('='.repeat(50) + '\n');

// Additional tips
console.log('💡 Tips for localhost testing:');
console.log('   • Use Chrome or Edge browser');
console.log('   • Open DevTools (F12) → Application tab');
console.log('   • Check Service Workers and Manifest sections');
console.log('   • Look for "Install" option in Chrome menu (⋮)');
console.log('   • Check Console for any errors');
console.log('\n📚 See LOCALHOST_INSTALL_GUIDE.md for detailed help\n');
