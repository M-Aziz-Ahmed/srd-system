#!/usr/bin/env node

/**
 * WebRTC Test Script
 * Tests basic WebRTC functionality and environment setup
 */

console.log('🧪 WebRTC Environment Test\n');

// Test 1: Check Node.js version
console.log('1. Node.js Version:');
console.log(`   ✅ ${process.version}\n`);

// Test 2: Check required dependencies
console.log('2. Dependencies Check:');
try {
  const pkg = require('./package.json');
  const requiredDeps = ['pusher', 'pusher-js', 'next', 'react'];
  
  requiredDeps.forEach(dep => {
    if (pkg.dependencies[dep]) {
      console.log(`   ✅ ${dep}: ${pkg.dependencies[dep]}`);
    } else {
      console.log(`   ❌ ${dep}: Missing`);
    }
  });
} catch (error) {
  console.log('   ❌ Could not read package.json');
}

console.log('');

// Test 3: Check environment variables
console.log('3. Environment Variables:');
require('dotenv').config();

const requiredEnvVars = [
  'PUSHER_APP_ID',
  'NEXT_PUBLIC_PUSHER_KEY', 
  'PUSHER_SECRET',
  'NEXT_PUBLIC_PUSHER_CLUSTER',
  'NEXTAUTH_SECRET',
  'MONGODB_URI'
];

requiredEnvVars.forEach(envVar => {
  if (process.env[envVar]) {
    console.log(`   ✅ ${envVar}: Set`);
  } else {
    console.log(`   ❌ ${envVar}: Missing`);
  }
});

console.log('');

// Test 4: Test Pusher connection
console.log('4. Pusher Connection Test:');
try {
  const Pusher = require('pusher');
  
  const pusher = new Pusher({
    appId: process.env.PUSHER_APP_ID,
    key: process.env.NEXT_PUBLIC_PUSHER_KEY,
    secret: process.env.PUSHER_SECRET,
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
    useTLS: true,
  });

  // Test trigger (this will fail if credentials are wrong)
  pusher.trigger('test-channel', 'test-event', { message: 'test' })
    .then(() => {
      console.log('   ✅ Pusher server connection: OK');
    })
    .catch((error) => {
      console.log('   ❌ Pusher server connection: Failed');
      console.log(`      Error: ${error.message}`);
    });

} catch (error) {
  console.log('   ❌ Pusher setup failed');
  console.log(`      Error: ${error.message}`);
}

console.log('');

// Test 5: File structure check
console.log('5. File Structure Check:');
const fs = require('fs');
const path = require('path');

const requiredFiles = [
  'src/components/SimpleCall.js',
  'src/app/api/webrtc/simple-signal/route.js',
  'src/app/call-test/page.js',
  'src/lib/pusher-server.js'
];

requiredFiles.forEach(file => {
  if (fs.existsSync(path.join(__dirname, file))) {
    console.log(`   ✅ ${file}: Exists`);
  } else {
    console.log(`   ❌ ${file}: Missing`);
  }
});

console.log('');

// Test 6: MongoDB connection (optional)
console.log('6. MongoDB Connection Test:');
if (process.env.MONGODB_URI) {
  const mongoose = require('mongoose');
  
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
      console.log('   ✅ MongoDB connection: OK');
      mongoose.disconnect();
    })
    .catch((error) => {
      console.log('   ❌ MongoDB connection: Failed');
      console.log(`      Error: ${error.message}`);
    });
} else {
  console.log('   ⚠️  MongoDB URI not set (optional)');
}

console.log('\n🏁 Test Complete!');
console.log('\nNext Steps:');
console.log('1. Fix any ❌ issues above');
console.log('2. Run: npm run dev');
console.log('3. Open: http://localhost:3000/call-test');
console.log('4. Test calls between different browsers/devices');