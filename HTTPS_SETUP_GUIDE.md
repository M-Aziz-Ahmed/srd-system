# 🔐 HTTPS Setup for Local Network

## 🎯 Goal

Enable HTTPS on your local network so PWA works on `https://192.168.9.149:3000`

---

## ⚡ Quick Setup (5 Minutes)

### Step 1: Install mkcert

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

### Step 2: Generate Certificates
```bash
npm run cert:generate
```

This will:
- Install local Certificate Authority
- Generate SSL certificates
- Create `localhost.pem` and `localhost-key.pem`

### Step 3: Start HTTPS Server
```bash
npm run dev:https
```

### Step 4: Access via HTTPS
```
https://localhost:3000
https://192.168.9.149:3000
```

### Step 5: Install PWA
Chrome menu (⋮) → **"Install SRDS"** ✅

---

## 🎉 What You Get

✅ **HTTPS on localhost** - `https://localhost:3000`
✅ **HTTPS on network IP** - `https://192.168.9.149:3000`
✅ **PWA "Install app"** - Full PWA support
✅ **Trusted certificate** - No browser warnings
✅ **Works on all devices** - On same network

---

## 📱 Access from Mobile

### Step 1: Install Certificate on Mobile

**Android:**
1. Copy `localhost.pem` to your phone
2. Settings → Security → Install certificate
3. Select the file
4. Done!

**iOS:**
1. Email `localhost.pem` to yourself
2. Open on iPhone
3. Settings → General → Profile
4. Install the certificate
5. Settings → General → About → Certificate Trust Settings
6. Enable trust for the certificate
7. Done!

### Step 2: Access via HTTPS
```
https://192.168.9.149:3000
```

### Step 3: Install PWA
Safari/Chrome menu → **"Install app"** ✅

---

## 🔧 Troubleshooting

### Certificate Warning in Browser

**First time only:**
1. Browser shows "Your connection is not private"
2. Click **"Advanced"**
3. Click **"Proceed to localhost"** (it's safe!)
4. Certificate is now trusted

### mkcert Not Found

**Windows:**
```powershell
# Install Chocolatey first if needed
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Then install mkcert
choco install mkcert
```

**Mac:**
```bash
# Install Homebrew first if needed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Then install mkcert
brew install mkcert
```

### Certificates Not Generated

Run manually:
```bash
# Install CA
mkcert -install

# Generate certificates
mkcert localhost 127.0.0.1 192.168.9.149 ::1

# Rename files
# Find the generated .pem files and rename to:
# - localhost.pem (certificate)
# - localhost-key.pem (private key)
```

### Server Won't Start

Check if certificates exist:
```bash
ls localhost.pem
ls localhost-key.pem
```

Both files should exist in project root!

### Port Already in Use

Change port:
```bash
PORT=3001 npm run dev:https
```

---

## 🆚 HTTP vs HTTPS

| Feature | HTTP | HTTPS |
|---------|------|-------|
| localhost | ✅ PWA works | ✅ PWA works |
| Network IP | ❌ No PWA | ✅ PWA works |
| Mobile devices | ❌ No PWA | ✅ PWA works |
| Security | ⚠️ Not secure | ✅ Secure |
| Certificate | Not needed | Required |

---

## 📊 Commands Reference

```bash
# Generate certificates (one-time setup)
npm run cert:generate

# Start HTTPS server
npm run dev:https

# Start regular HTTP server (localhost only)
npm run dev

# Check HTTPS setup help
npm run https:help
```

---

## 🎯 Testing Checklist

- [ ] mkcert installed
- [ ] Certificates generated (`localhost.pem` and `localhost-key.pem` exist)
- [ ] HTTPS server starts without errors
- [ ] Can access `https://localhost:3000`
- [ ] Can access `https://192.168.9.149:3000`
- [ ] Chrome shows "Install SRDS" (not "Add to Home screen")
- [ ] PWA installs successfully
- [ ] App opens in standalone window

---

## 💡 Pro Tips

### Tip 1: Keep Certificates
Don't delete `localhost.pem` and `localhost-key.pem` - you only need to generate them once!

### Tip 2: Add to .gitignore
Certificates are already in `.gitignore` - don't commit them!

### Tip 3: Regenerate if IP Changes
If your IP changes, regenerate certificates with new IP:
```bash
mkcert localhost 127.0.0.1 YOUR_NEW_IP ::1
```

### Tip 4: Use for All Projects
These certificates work for any local project on the same IPs!

---

## 🔒 Security Notes

### Is This Safe?
✅ **Yes!** mkcert creates a local Certificate Authority that only you trust.
✅ Certificates only work on your computer/network
✅ Not valid on the internet
✅ Perfect for local development

### Should I Commit Certificates?
❌ **No!** Never commit certificates to git
✅ Each developer generates their own
✅ Already in `.gitignore`

---

## 🎉 Success!

Once setup is complete:

✅ HTTPS works on `https://192.168.9.149:3000`
✅ Chrome shows **"Install SRDS"** option
✅ PWA installs as real app
✅ Standalone window mode
✅ Works on mobile devices
✅ Full PWA features enabled

---

## 🚀 Quick Start Summary

```bash
# 1. Install mkcert (one-time)
choco install mkcert  # Windows
brew install mkcert   # Mac

# 2. Generate certificates (one-time)
npm run cert:generate

# 3. Start HTTPS server
npm run dev:https

# 4. Open in browser
https://192.168.9.149:3000

# 5. Install PWA
Chrome menu → "Install SRDS" ✅
```

---

## 📚 Additional Resources

- mkcert: https://github.com/FiloSottile/mkcert
- Next.js Custom Server: https://nextjs.org/docs/advanced-features/custom-server
- PWA Requirements: https://web.dev/install-criteria/

---

## ✅ You're Ready!

Your app will now work as a full PWA on your local network with HTTPS! 🎉🔐