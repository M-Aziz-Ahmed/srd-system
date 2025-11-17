# Enable HTTPS for Local Testing

## The Problem

WebRTC requires HTTPS when accessing from IP addresses like `http://192.168.x.x:3000`

Browsers block microphone/camera access on non-HTTPS connections (except localhost).

## Quick Solutions

### Solution 1: Use Localhost (Easiest)

Test on the **same computer** with 2 browser tabs:
```
http://localhost:3000/test-call
```

This works because browsers allow microphone on `localhost` without HTTPS.

### Solution 2: Use ngrok (Recommended for Testing)

**ngrok** creates a secure HTTPS tunnel to your local server.

#### Step 1: Install ngrok
Download from: https://ngrok.com/download

Or with npm:
```bash
npm install -g ngrok
```

#### Step 2: Start Your Server
```bash
npm run dev
```

#### Step 3: Start ngrok (in another terminal)
```bash
ngrok http 3000
```

#### Step 4: Use the HTTPS URL
ngrok will show:
```
Forwarding  https://abc123.ngrok.io -> http://localhost:3000
```

Use `https://abc123.ngrok.io/test-call` on ANY device!

### Solution 3: Deploy to Vercel (Best for Real Testing)

Vercel automatically provides HTTPS:

```bash
git add .
git commit -m "Ready for testing"
git push
```

Then use: `https://your-app.vercel.app/test-call`

### Solution 4: Self-Signed Certificate (Advanced)

Create HTTPS locally with self-signed certificate.

#### Step 1: Install mkcert
```bash
# Windows (with Chocolatey)
choco install mkcert

# Mac
brew install mkcert
```

#### Step 2: Create Certificate
```bash
mkcert -install
mkcert localhost 192.168.16.102
```

#### Step 3: Update package.json
```json
{
  "scripts": {
    "dev": "next dev",
    "dev:https": "next dev --experimental-https --experimental-https-key ./localhost+1-key.pem --experimental-https-cert ./localhost+1.pem"
  }
}
```

#### Step 4: Run with HTTPS
```bash
npm run dev:https
```

Now use: `https://192.168.16.102:3000/test-call`

## Recommended Approach

For quick testing:

1. **Same Computer**: Use `localhost` with 2 tabs
2. **Different Devices**: Use **ngrok** (free, easy, works everywhere)
3. **Production**: Deploy to **Vercel** (automatic HTTPS)

## ngrok Quick Start

```bash
# Terminal 1
npm run dev

# Terminal 2
ngrok http 3000

# Copy the https URL and use it on any device!
```

## Why This Happens

Browser security policy:
- ✅ `http://localhost` - Microphone allowed
- ✅ `https://anything` - Microphone allowed
- ❌ `http://192.168.x.x` - Microphone BLOCKED
- ❌ `http://your-ip` - Microphone BLOCKED

This is to prevent malicious websites from accessing your microphone without encryption.

## Test Now

### Option A: Same Computer (2 Tabs)
```
http://localhost:3000/test-call
```

### Option B: Different Devices (ngrok)
```bash
# Install
npm install -g ngrok

# Run (in new terminal)
ngrok http 3000

# Use the https URL on any device
```

### Option C: Deploy to Vercel
```bash
git push
# Use: https://your-app.vercel.app/test-call
```

---

**Recommendation**: Use **ngrok** for testing on different devices. It's free, easy, and works perfectly!
