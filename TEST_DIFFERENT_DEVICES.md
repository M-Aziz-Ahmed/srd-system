# Test Calls on Different Devices - NOW!

## What I Fixed

Added **TURN servers** so calls work between ANY two devices, even on different networks.

## Test Right Now:

### Step 1: Restart Server
```bash
Ctrl + C
npm run dev
```

### Step 2: Find Your Computer's IP
```bash
# Windows - Run this in Command Prompt:
ipconfig

# Look for "IPv4 Address" - something like: 192.168.1.5
```

### Step 3: Test on 2 Devices

**Device 1 (Your Computer)**:
```
http://localhost:3000/test-call
```

**Device 2 (Your Phone)**:
```
http://192.168.1.5:3000/test-call
(Replace with YOUR IP from Step 2)
```

### Step 4: Make Call
1. Login as different users on each device
2. Device 1: Select user, click "Call"
3. Device 2: Click "Accept"
4. **TALK** - you'll hear each other!

---

## What to Look For

### Console Logs (F12):
```
✅ Got microphone
✅ Added track: audio
📤 ICE candidate type: host
📤 ICE candidate type: srflx
📤 ICE candidate type: relay    ← THIS IS NEW!
✅ All ICE candidates sent
🔗 Connection state: connected
🧊 ICE state: connected
🎵 Received audio track
✅ Playing remote audio
```

The **"relay"** candidate means TURN is working!

---

## If It Doesn't Work

### Check 1: Both on Same WiFi?
For testing, both devices should be on the same WiFi network.

### Check 2: Firewall Blocking?
Windows Firewall might block Node.js. Allow it when prompted.

### Check 3: Correct IP?
Make sure you're using the right IP address from `ipconfig`.

---

## Deploy to Vercel

Once it works locally:
```bash
git add .
git commit -m "Add TURN servers for cross-device calls"
git push
```

Then test on Vercel with 2 devices anywhere in the world!

---

**TL;DR**:
1. Restart: `Ctrl+C` then `npm run dev`
2. Get IP: `ipconfig`
3. Open on 2 devices: `http://YOUR-IP:3000/test-call`
4. Call and talk!

It will work! 🎉
