#!/usr/bin/env node

/**
 * HTTPS Setup for Local Network Testing
 * Generates self-signed certificates for testing PWA on network IP
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('\n🔐 HTTPS Setup for Local Network Testing\n');

console.log('⚠️  IMPORTANT: PWA requires HTTPS when accessed via IP address!\n');
console.log('Chrome allows HTTP only for:');
console.log('  ✅ localhost');
console.log('  ✅ 127.0.0.1');
console.log('  ❌ 192.168.x.x (requires HTTPS!)\n');

console.log('📋 You have 3 options:\n');

console.log('Option 1: Use localhost (Easiest)');
console.log('─────────────────────────────────');
console.log('Access from same computer:');
console.log('  http://localhost:3000 ✅\n');

console.log('Option 2: Use ngrok (Quick Testing)');
console.log('─────────────────────────────────');
console.log('1. Install ngrok: https://ngrok.com/download');
console.log('2. Run: npm run dev');
console.log('3. In another terminal: ngrok http 3000');
console.log('4. Use the HTTPS URL provided by ngrok ✅\n');

console.log('Option 3: Self-Signed Certificate (Advanced)');
console.log('─────────────────────────────────────────────');
console.log('Requires mkcert installation:\n');

// Check if mkcert is installed
try {
  execSync('mkcert -version', { stdio: 'ignore' });
  console.log('✅ mkcert is installed!\n');
  console.log('Run these commands:\n');
  console.log('1. mkcert -install');
  console.log('2. mkcert localhost 192.168.9.149 127.0.0.1');
  console.log('3. Create server.js (see HTTPS_SETUP.md)');
  console.log('4. npm run dev:https\n');
} catch (error) {
  console.log('❌ mkcert not installed\n');
  console.log('Install mkcert:');
  console.log('  Windows: choco install mkcert');
  console.log('  Mac: brew install mkcert');
  console.log('  Linux: See https://github.com/FiloSottile/mkcert\n');
}

console.log('═'.repeat(60));
console.log('🎯 RECOMMENDED SOLUTION: Use ngrok');
console.log('═'.repeat(60));
console.log('\nQuick steps:');
console.log('1. Download ngrok: https://ngrok.com/download');
console.log('2. Extract and run: ngrok http 3000');
console.log('3. Use the HTTPS URL (e.g., https://abc123.ngrok.io)');
console.log('4. Access from any device on any network!');
console.log('5. PWA will work with full "Install app" option ✅\n');

console.log('📚 For detailed instructions, see: NETWORK_PWA_SETUP.md\n');
