#!/usr/bin/env node

/**
 * Generate Self-Signed SSL Certificate for Local HTTPS
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('\n🔐 Generating SSL Certificate for Local HTTPS\n');

// Check if mkcert is installed
try {
  execSync('mkcert -version', { stdio: 'pipe' });
  console.log('✅ mkcert is installed\n');
} catch (error) {
  console.log('❌ mkcert is not installed!\n');
  console.log('Please install mkcert first:\n');
  console.log('Windows (PowerShell as Admin):');
  console.log('  choco install mkcert\n');
  console.log('Mac:');
  console.log('  brew install mkcert\n');
  console.log('Linux:');
  console.log('  sudo apt install libnss3-tools');
  console.log('  wget https://github.com/FiloSottile/mkcert/releases/download/v1.4.4/mkcert-v1.4.4-linux-amd64');
  console.log('  chmod +x mkcert-v1.4.4-linux-amd64');
  console.log('  sudo mv mkcert-v1.4.4-linux-amd64 /usr/local/bin/mkcert\n');
  console.log('Or download from: https://github.com/FiloSottile/mkcert\n');
  process.exit(1);
}

// Install local CA
console.log('📋 Step 1: Installing local Certificate Authority...');
try {
  execSync('mkcert -install', { stdio: 'inherit' });
  console.log('✅ Local CA installed\n');
} catch (error) {
  console.error('❌ Failed to install local CA');
  process.exit(1);
}

// Generate certificates
console.log('📋 Step 2: Generating certificates...');
console.log('   Creating certificates for:');
console.log('   - localhost');
console.log('   - 127.0.0.1');
console.log('   - 192.168.9.149');
console.log('   - ::1 (IPv6)\n');

try {
  execSync('mkcert localhost 127.0.0.1 192.168.9.149 ::1', { stdio: 'inherit' });
  console.log('\n✅ Certificates generated!\n');
} catch (error) {
  console.error('❌ Failed to generate certificates');
  process.exit(1);
}

// Check if files were created
const certFiles = [
  'localhost+3.pem',
  'localhost+3-key.pem'
];

let foundCert = null;
let foundKey = null;

// mkcert creates files with different names, find them
const files = fs.readdirSync('.');
for (const file of files) {
  if (file.endsWith('.pem') && !file.includes('-key')) {
    foundCert = file;
  }
  if (file.endsWith('-key.pem')) {
    foundKey = file;
  }
}

if (foundCert && foundKey) {
  // Rename to standard names
  fs.renameSync(foundCert, 'localhost.pem');
  fs.renameSync(foundKey, 'localhost-key.pem');
  console.log('📋 Step 3: Renamed certificates to standard names\n');
  console.log('✅ Certificate: localhost.pem');
  console.log('✅ Private Key: localhost-key.pem\n');
} else {
  console.log('⚠️  Certificate files not found with expected names');
  console.log('   Please rename them manually to:');
  console.log('   - localhost.pem (certificate)');
  console.log('   - localhost-key.pem (private key)\n');
}

console.log('═'.repeat(60));
console.log('🎉 Setup Complete!\n');
console.log('Next steps:');
console.log('1. Start HTTPS server: npm run dev:https');
console.log('2. Open: https://localhost:3000');
console.log('3. Or: https://192.168.9.149:3000');
console.log('4. Chrome menu → "Install SRDS" ✅\n');
console.log('💡 Your browser may show a security warning on first visit.');
console.log('   Click "Advanced" → "Proceed to localhost" (it\'s safe!)\n');
console.log('═'.repeat(60) + '\n');
