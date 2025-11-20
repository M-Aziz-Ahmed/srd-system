# 🔐 Enable HTTPS Now - 3 Steps

## ⚡ Quick Setup for Network IP

Your PWA doesn't work on `http://192.168.9.149:3000` because Chrome requires HTTPS for IP addresses.

**Let's fix it in 3 steps:**

---

## Step 1: Install mkcert

**Windows (Run PowerShell as Administrator):**
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

## Step 2: Generate Certificates

```bash
npm run cert:generate
```

This creates:
- `localhost.pem` (certificate)
- `localhost-key.pem` (private key)

---

## Step 3: Start HTTPS Server

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

## ✅ Test It!

Open in Chrome:
```
https://192.168.9.149:3000
```

Click Chrome menu (⋮) → **"Install SRDS"** ✅

---

## 🎉 Done!

Your PWA now works on network IP with HTTPS!

✅ `https://192.168.9.149:3000` - Full PWA
✅ Chrome shows "Install app"
✅ Standalone window mode
✅ Works on mobile devices

---

## 📱 Access from Phone

1. Open `https://192.168.9.149:3000` on phone
2. Accept certificate warning (first time only)
3. Install app works! ✅

---

## 🔧 Troubleshooting

### "mkcert: command not found"
Install mkcert first (see Step 1)

### "Certificate files not found"
Run `npm run cert:generate` again

### Browser shows security warning
Click "Advanced" → "Proceed" (it's safe for local development)

### Port 3000 already in use
```bash
PORT=3001 npm run dev:https
```

---

## 💡 Commands

```bash
# Generate certificates (one-time)
npm run cert:generate

# Start HTTPS server
npm run dev:https

# Start regular HTTP (localhost only)
npm run dev
```

---

## 📚 More Info

See **HTTPS_SETUP_GUIDE.md** for:
- Detailed instructions
- Mobile device setup
- Troubleshooting
- Security notes

---

## ✅ Summary

**3 commands, 5 minutes, HTTPS enabled!**

1. `choco install mkcert` (or brew/apt)
2. `npm run cert:generate`
3. `npm run dev:https`

**Your PWA now works on network IP!** 🚀🔐