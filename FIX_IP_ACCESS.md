# Fix: Microphone Blocked on IP Address

## The Error You're Seeing

Microphone doesn't work on: `http://192.168.16.102:3000/inbox`

## Why?

Browsers **block microphone access** on non-HTTPS connections (except localhost).

## Quick Fix: Use ngrok (2 Minutes)

### Step 1: Install ngrok
```bash
npm install -g ngrok
```

### Step 2: Keep Your Server Running
```bash
npm run dev
```

### Step 3: Open New Terminal, Run ngrok
```bash
ngrok http 3000
```

### Step 4: Use the HTTPS URL
ngrok will show something like:
```
Forwarding  https://abc123.ngrok.io -> http://localhost:3000
```

**Use this URL on ANY device**:
```
https://abc123.ngrok.io/test-call
```

## That's It!

Now microphone will work because you're using HTTPS.

---

## Alternative: Test on Same Computer

If you just want to test quickly:

```
http://localhost:3000/test-call
```

Open 2 browser tabs on the same computer. This works because browsers allow microphone on `localhost`.

---

## For Production: Deploy to Vercel

```bash
git add .
git commit -m "Add TURN servers and fixes"
git push
```

Then use: `https://your-app.vercel.app/test-call`

Vercel automatically provides HTTPS.

---

## Why This Happens

Browser Security:
- ✅ `https://anything` → Microphone allowed
- ✅ `http://localhost` → Microphone allowed
- ❌ `http://192.168.x.x` → Microphone **BLOCKED**

This protects users from malicious websites accessing their microphone without encryption.

---

## Quick Commands

```bash
# Terminal 1 (keep running)
npm run dev

# Terminal 2 (new terminal)
npm install -g ngrok
ngrok http 3000

# Copy the https URL and use it!
```

---

**TL;DR**: Install ngrok, run `ngrok http 3000`, use the https URL. Done! ✅
