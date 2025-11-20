#!/usr/bin/env node

/**
 * PWA Fix Script - Diagnose and fix installation issues
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔧 PWA Installation Fix Script\n');
console.log('Diagnosing why "Install app" is not showing...\n');

let issues = [];
let fixes = [];

// Check 1: PNG Icons
console.log('1️⃣  Checking PNG icons...');
const icon192 = path.join(__dirname, 'public', 'icons', 'icon-192x192.png');
const icon512 = path.join(__dirname, 'public', 'icons', 'icon-512x512.png');

if (fs.existsSync(icon192) && fs.existsSync(icon512)) {
  const size192 = fs.statSync(icon192).size;
  const size512 = fs.statSync(icon512).size;
  console.log(`   ✅ icon-192x192.png exists (${size192} bytes)`);
  console.log(`   ✅ icon-512x512.png exists (${size512} bytes)`);
  
  if (size192 < 100 || size512 < 100) {
    console.log('   ⚠️  Icons seem too small - might be corrupted');
    issues.push('Icons might be corrupted');
    fixes.push('Regenerate icons using create-pwa-icons.html');
  }
} else {
  console.log('   ❌ PNG icons missing!');
  issues.push('PNG icons not found');
  fixes.push('Open create-pwa-icons.html and download both PNG icons');
}

// Check 2: Manifest
console.log('\n2️⃣  Checking manifest.json...');
const manifestPath = path.join(__dirname, 'public', 'manifest.json');
if (fs.existsSync(manifestPath)) {
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    console.log('   ✅ Manifest exists and is valid JSON');
    
    // Check critical fields
    if (!manifest.name) {
      console.log('   ❌ Missing "name" field');
      issues.push('Manifest missing name');
    } else {
      console.log(`   ✅ Name: ${manifest.name}`);
    }
    
    if (manifest.display !== 'standalone') {
      console.log(`   ⚠️  Display mode is "${manifest.display}" (should be "standalone")`);
      issues.push('Display mode not standalone');
    } else {
      console.log('   ✅ Display: standalone');
    }
    
    if (!manifest.start_url) {
      console.log('   ❌ Missing "start_url"');
      issues.push('Missing start_url');
    } else {
      console.log(`   ✅ Start URL: ${manifest.start_url}`);
    }
    
    // Check icons
    const pngIcons = manifest.icons.filter(icon => icon.type === 'image/png');
    if (pngIcons.length < 2) {
      console.log('   ❌ Need at least 2 PNG icons in manifest');
      issues.push('Not enough PNG icons in manifest');
    } else {
      console.log(`   ✅ ${pngIcons.length} PNG icons defined`);
    }
    
  } catch (error) {
    console.log('   ❌ Manifest has JSON errors:', error.message);
    issues.push('Manifest JSON error');
  }
} else {
  console.log('   ❌ Manifest not found');
  issues.push('Manifest missing');
}

// Check 3: Service Worker
console.log('\n3️⃣  Checking service worker...');
const swPath = path.join(__dirname, 'public', 'sw.js');
if (fs.existsSync(swPath)) {
  console.log('   ✅ Service worker exists');
  const swContent = fs.readFileSync(swPath, 'utf8');
  if (!swContent.includes('fetch')) {
    console.log('   ⚠️  Service worker missing fetch handler');
    issues.push('Service worker incomplete');
  }
} else {
  console.log('   ❌ Service worker not found');
  issues.push('Service worker missing');
}

// Check 4: HTTPS/Localhost
console.log('\n4️⃣  Checking environment...');
console.log('   ℹ️  For localhost: Chrome allows PWA without HTTPS');
console.log('   ℹ️  For production: HTTPS is required');

// Summary
console.log('\n' + '='.repeat(60));
if (issues.length === 0) {
  console.log('✅ All checks passed!');
  console.log('\n🎯 Your PWA should work. Try these steps:\n');
  console.log('1. Stop your dev server (Ctrl+C)');
  console.log('2. Clear browser cache:');
  console.log('   - Press Ctrl+Shift+Delete');
  console.log('   - Select "Cached images and files"');
  console.log('   - Click "Clear data"');
  console.log('3. Close ALL Chrome windows');
  console.log('4. Restart dev server: npm run dev');
  console.log('5. Open http://localhost:3000 in NEW Chrome window');
  console.log('6. Wait 5 seconds for service worker to register');
  console.log('7. Check Chrome menu (⋮) for "Install SRDS"');
  console.log('\n💡 If still not working, check DevTools:');
  console.log('   F12 → Application → Manifest (check for errors)');
  console.log('   F12 → Application → Service Workers (should be "activated")');
  console.log('   F12 → Console (look for red errors)');
} else {
  console.log('⚠️  Issues found:\n');
  issues.forEach((issue, i) => {
    console.log(`   ${i + 1}. ${issue}`);
  });
  console.log('\n🔧 Fixes needed:\n');
  fixes.forEach((fix, i) => {
    console.log(`   ${i + 1}. ${fix}`);
  });
}
console.log('='.repeat(60));

// Additional diagnostics
console.log('\n📊 Additional Info:\n');
console.log('Current setup:');
console.log(`   • Manifest: ${fs.existsSync(manifestPath) ? '✅' : '❌'}`);
console.log(`   • Service Worker: ${fs.existsSync(swPath) ? '✅' : '❌'}`);
console.log(`   • PNG Icons: ${fs.existsSync(icon192) && fs.existsSync(icon512) ? '✅' : '❌'}`);

console.log('\n🎯 Expected behavior on localhost:');
console.log('   • Chrome menu shows "Install SRDS" (not "Add to Home screen")');
console.log('   • Install icon (⊕) appears in address bar');
console.log('   • Installation creates standalone app window');

console.log('\n📚 For more help, see:');
console.log('   • INSTALL_APP_FIX.md - Complete troubleshooting guide');
console.log('   • LOCALHOST_INSTALL_GUIDE.md - Detailed localhost setup');
console.log('   • FIX_INSTALL_OPTION.md - Icon generation guide\n');
