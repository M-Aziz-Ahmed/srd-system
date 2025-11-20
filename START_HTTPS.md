# 🚀 Start HTTPS Server - Quick Guide

## ⚡ 3 Commands to Enable HTTPS

### Step 1: Install mkcert (One-Time Setup)

**Windows (PowerShell as Administrator):**
```powershell
choco install mkcert
```

**Mac:**
```bash
brew install mkcert
```

**Linux:**
```bash
sudo apt install libnss3-tools
wget https://github.com/FiloSottile/mkcert/releases/download/v1.4.4/mkcert-v1.4.4-linux-amd64
chmod +x mkcert-v1.4.4-linux-amd64
sudo mv mkcert-v1.4.4-linux-amd64 /usr/local/bin/mkcert
```

---

### Step 2: Generate Certificates (One-Time Setup)

```bash
npm run cert:generate
```

This creates:
- `localhost.pem` (SSL certificate)
- `localhost-key.pem` (Private key)

---

### Step 3: Start HTTPS Server

```bash
npm run dev:https
```

You'll see:
```
🔐 HTTPS Server Ready!

✅ Local:    https://localhost:3000
✅ Network:  https://192.168.9.149:3000

💡 PWA "Install app" option will now work!
```

---

## ✅ Access Your App

Open in Chrome:
- **Same computer:** `https://localhost:3000`
- **Other devices:** `https://192.168.9.149:3000`

---

## 🎯 Install PWA

1. Open the HTTPS URL
2. Click Chrome menu (⋮)
3. Click **"Install SRDS"** ✅
4. Done!

---

## 🔧 Troubleshooting

### Error: "SSL Certificates not found"

Run:
```bash
npm run cert:generate
```

### Error: "mkcert: command not found"

Install mkcert first (see Step 1)

### Browser Shows Security Warning

**First time only:**
1. Click "Advanced"
2. Click "Proceed to localhost (unsafe)"
3. It's safe - it's your own certificate!

### Port 3000 Already in Use

```bash
PORT=3001 npm run dev:https
```

---

## 💡 Quick Reference

```bash
# One-time setup
choco install mkcert        # Install mkcert
npm run cert:generate       # Generate certificates

# Every time you develop
npm run dev:https           # Start HTTPS server

# Regular HTTP (localhost only)
npm run dev                 # Start HTTP server
```

---

## 🎉 Success!

Once HTTPS is running:

✅ PWA works on network IP
✅ "Install app" option appears
✅ Standalone window mode
✅ Works on mobile devices
✅ Full PWA features

---

## 📱 Mobile Access

1. Open `https://192.168.9.149:3000` on phone
2. Accept certificate warning (first time)
3. Install app works! ✅

---

## ✅ You're Ready!

Your PWA now works with HTTPS on your local network! 🔐🎉

**See HTTPS_SETUP_GUIDE.md for detailed documentation.**