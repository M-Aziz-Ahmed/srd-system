#!/usr/bin/env node

/**
 * PWA Setup Helper Script
 * Guides you through setting up the Progressive Web App
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  console.log('\n🚀 PWA Setup Helper\n');
  console.log('This script will help you set up your Progressive Web App.\n');

  // Check 1: Icons
  console.log('📱 Step 1: App Icons');
  const iconsDir = path.join(__dirname, 'public', 'icons');
  const requiredIcons = [
    'icon-72x72.png',
    'icon-96x96.png',
    'icon-128x128.png',
    'icon-144x144.png',
    'icon-152x152.png',
    'icon-192x192.png',
    'icon-384x384.png',
    'icon-512x512.png'
  ];

  let iconsExist = true;
  if (fs.existsSync(iconsDir)) {
    const missingIcons = requiredIcons.filter(icon => 
      !fs.existsSync(path.join(iconsDir, icon))
    );
    
    if (missingIcons.length > 0) {
      console.log('❌ Missing icons:', missingIcons.join(', '));
      iconsExist = false;
    } else {
      console.log('✅ All icons found!');
    }
  } else {
    console.log('❌ Icons directory not found');
    iconsExist = false;
  }

  if (!iconsExist) {
    console.log('\nTo create icons:');
    console.log('1. Open create-placeholder-icons.html in your browser');
    console.log('2. Download all icons');
    console.log('3. Save them in public/icons/ folder\n');
    
    const continueSetup = await question('Continue anyway? (y/n): ');
    if (continueSetup.toLowerCase() !== 'y') {
      console.log('\nSetup cancelled. Please create icons first.');
      rl.close();
      return;
    }
  }

  // Check 2: VAPID Keys
  console.log('\n🔐 Step 2: VAPID Keys for Push Notifications');
  
  require('dotenv').config();
  
  const hasVapidKeys = process.env.VAPID_PUBLIC_KEY && 
                       process.env.VAPID_PRIVATE_KEY &&
                       process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

  if (hasVapidKeys) {
    console.log('✅ VAPID keys found in .env');
  } else {
    console.log('❌ VAPID keys not found in .env');
    console.log('\nTo generate VAPID keys:');
    console.log('1. Run: npx web-push generate-vapid-keys');
    console.log('2. Add to .env file:');
    console.log('   VAPID_PUBLIC_KEY=your_public_key');
    console.log('   VAPID_PRIVATE_KEY=your_private_key');
    console.log('   NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key');
    console.log('   VAPID_EMAIL=admin@yourdomain.com\n');
    
    const generateNow = await question('Generate VAPID keys now? (y/n): ');
    if (generateNow.toLowerCase() === 'y') {
      console.log('\nRun this command:');
      console.log('npx web-push generate-vapid-keys\n');
    }
  }

  // Check 3: Dependencies
  console.log('\n📦 Step 3: Dependencies');
  
  try {
    const pkg = require('./package.json');
    
    if (pkg.dependencies['web-push']) {
      console.log('✅ web-push installed');
    } else {
      console.log('❌ web-push not installed');
      console.log('Run: npm install');
    }
  } catch (error) {
    console.log('❌ Could not read package.json');
  }

  // Check 4: Service Worker
  console.log('\n⚙️  Step 4: Service Worker');
  
  const swPath = path.join(__dirname, 'public', 'sw.js');
  if (fs.existsSync(swPath)) {
    console.log('✅ Service worker found');
  } else {
    console.log('❌ Service worker not found');
  }

  // Check 5: Manifest
  console.log('\n📄 Step 5: Web App Manifest');
  
  const manifestPath = path.join(__dirname, 'public', 'manifest.json');
  if (fs.existsSync(manifestPath)) {
    console.log('✅ Manifest found');
    
    try {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      console.log(`   App Name: ${manifest.name}`);
      console.log(`   Short Name: ${manifest.short_name}`);
      console.log(`   Theme Color: ${manifest.theme_color}`);
    } catch (error) {
      console.log('⚠️  Could not parse manifest.json');
    }
  } else {
    console.log('❌ Manifest not found');
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Setup Summary');
  console.log('='.repeat(50));
  
  const checks = [
    { name: 'App Icons', status: iconsExist },
    { name: 'VAPID Keys', status: hasVapidKeys },
    { name: 'Dependencies', status: true },
    { name: 'Service Worker', status: fs.existsSync(swPath) },
    { name: 'Manifest', status: fs.existsSync(manifestPath) }
  ];

  checks.forEach(check => {
    console.log(`${check.status ? '✅' : '❌'} ${check.name}`);
  });

  const allComplete = checks.every(check => check.status);

  console.log('\n' + '='.repeat(50));
  
  if (allComplete) {
    console.log('🎉 Setup Complete!');
    console.log('\nYour PWA is ready to deploy!');
    console.log('\nNext steps:');
    console.log('1. Run: npm run build');
    console.log('2. Deploy to production with HTTPS');
    console.log('3. Test installation on mobile devices');
    console.log('\nFor detailed instructions, see PWA_SETUP_GUIDE.md');
  } else {
    console.log('⚠️  Setup Incomplete');
    console.log('\nPlease complete the missing steps above.');
    console.log('See PWA_SETUP_GUIDE.md for detailed instructions.');
  }

  console.log('\n');
  rl.close();
}

main().catch(error => {
  console.error('Error:', error);
  rl.close();
  process.exit(1);
});