# HTTPS Setup - Local Testing Ke Liye

## Problem Kya Hai

WebRTC ko HTTPS chahiye jab aap IP address use karte hain jaise `http://192.168.x.x:3000`

Browser microphone/camera access block kar deta hai non-HTTPS connections par (localhost ke ilawa).

## Aasan Solutions

### Solution 1: Localhost Use Karein (Sabse Aasan)

**Same computer** par 2 browser tabs mein test karein:
```
http://localhost:3000/test-call
```

Ye kaam karega kyunki browsers `localhost` par microphone allow karte hain bina HTTPS ke.

### Solution 2: ngrok Use Karein (Recommended)

**ngrok** aapke local server ko secure HTTPS tunnel de deta hai.

#### Step 1: ngrok Install Karein
Download karein: https://ngrok.com/download

Ya npm se:
```bash
npm install -g ngrok
```

#### Step 2: Server Start Karein
```bash
npm run dev
```

#### Step 3: ngrok Start Karein (dusre terminal mein)
```bash
ngrok http 3000
```

#### Step 4: HTTPS URL Use Karein
ngrok dikhayega:
```
Forwarding  https://abc123.ngrok.io -> http://localhost:3000
```

`https://abc123.ngrok.io/test-call` ko KISI BHI device par use karein!

### Solution 3: Vercel Par Deploy Karein (Best)

Vercel automatically HTTPS deta hai:

```bash
git add .
git commit -m "Ready for testing"
git push
```

Phir use karein: `https://your-app.vercel.app/test-call`

## Recommended Tarika

Quick testing ke liye:

1. **Same Computer**: `localhost` use karein 2 tabs ke saath
2. **Alag Devices**: **ngrok** use karein (free, aasan, har jagah kaam karta hai)
3. **Production**: **Vercel** par deploy karein (automatic HTTPS)

## ngrok Quick Start

```bash
# Terminal 1
npm run dev

# Terminal 2
ngrok http 3000

# https URL copy karein aur kisi bhi device par use karein!
```

## Ye Kyun Hota Hai

Browser security policy:
- ✅ `http://localhost` - Microphone allowed
- ✅ `https://kuch-bhi` - Microphone allowed
- ❌ `http://192.168.x.x` - Microphone BLOCKED
- ❌ `http://aapka-ip` - Microphone BLOCKED

Ye isliye hai taake malicious websites bina encryption ke aapka microphone access na kar sakein.

## Ab Test Karein

### Option A: Same Computer (2 Tabs)
```
http://localhost:3000/test-call
```

### Option B: Alag Devices (ngrok)
```bash
# Install karein
npm install -g ngrok

# Chalayein (naye terminal mein)
ngrok http 3000

# https URL ko kisi bhi device par use karein
```

### Option C: Vercel Par Deploy
```bash
git push
# Use karein: https://your-app.vercel.app/test-call
```

---

## Step by Step (ngrok ke saath)

### 1. ngrok Install Karein
```bash
npm install -g ngrok
```

### 2. Server Chalayein
```bash
npm run dev
```

### 3. Naya Terminal Kholen
```bash
ngrok http 3000
```

### 4. URL Copy Karein
ngrok dikhayega:
```
Session Status    online
Forwarding        https://1234abcd.ngrok.io -> http://localhost:3000
```

### 5. Kisi Bhi Device Par Use Karein
- Phone par: `https://1234abcd.ngrok.io/test-call`
- Laptop par: `https://1234abcd.ngrok.io/test-call`
- Tablet par: `https://1234abcd.ngrok.io/test-call`

### 6. Call Karein
- Alag alag users se login karein
- Call karein
- **Kaam karega!** ✅

---

**Recommendation**: Testing ke liye **ngrok** use karein. Free hai, aasan hai, aur perfectly kaam karta hai!

## Important Notes

- ngrok free tier: 1 tunnel at a time
- URL har baar change hota hai (free tier mein)
- Production ke liye Vercel use karein (permanent URL)

---

**TL;DR**:
1. `npm install -g ngrok`
2. `npm run dev` (ek terminal)
3. `ngrok http 3000` (dusra terminal)
4. https URL use karein kisi bhi device par
5. Done! ✅
