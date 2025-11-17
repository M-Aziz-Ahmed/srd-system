# HTTP Par Microphone Allow Karein (Testing Ke Liye)

## Chrome Flag Method (Sabse Aasan)

### Step 1: Chrome Flags Kholen
Address bar mein ye paste karein:
```
chrome://flags/#unsafely-treat-insecure-origin-as-secure
```

### Step 2: Apna URL Add Karein
Field mein ye type karein:
```
http://192.168.16.102:3000
```

### Step 3: Enable Karein
Dropdown ko **"Enabled"** par set karein

### Step 4: Chrome Restart Karein
Neeche "Relaunch" button dabayein

### Step 5: Test Karein
Jayein: `http://192.168.16.102:3000/test-call`

Ab microphone kaam karega!

---

## Alternative: Chrome Command Line Se

### Windows:
Chrome completely band karein, phir ye run karein:
```cmd
"C:\Program Files\Google\Chrome\Application\chrome.exe" --unsafely-treat-insecure-origin-as-secure="http://192.168.16.102:3000" --user-data-dir=C:\temp\chrome-test
```

### Mac:
```bash
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --unsafely-treat-insecure-origin-as-secure="http://192.168.16.102:3000" --user-data-dir=/tmp/chrome-test
```

---

## Firefox Method

### Step 1: Config Kholen
Address bar mein:
```
about:config
```

### Step 2: Warning Accept Karein
"Accept the Risk and Continue" dabayein

### Step 3: Search Karein
Search karein: `media.devices.insecure.enabled`

### Step 4: Enable Karein
**true** par set karein

### Step 5: Phir Search Karein
Search karein: `media.getusermedia.insecure.enabled`

### Step 6: Enable Karein
**true** par set karein

### Step 7: Test Karein
Jayein: `http://192.168.16.102:3000/test-call`

---

## Edge Method

Chrome jaisa hi - use karein:
```
edge://flags/#unsafely-treat-insecure-origin-as-secure
```

Add karein: `http://192.168.16.102:3000`

Enable karein aur restart karein.

---

## Quick Chrome Setup (Copy-Paste)

1. Naya tab kholen
2. Paste karein: `chrome://flags/#unsafely-treat-insecure-origin-as-secure`
3. Field mein paste karein: `http://192.168.16.102:3000`
4. Dropdown ko "Enabled" karein
5. "Relaunch" dabayein
6. Ho gaya!

---

## Mobile Testing Ke Liye

### Android Chrome:
1. Chrome kholen
2. Jayein: `chrome://flags`
3. Search karein: "insecure origins"
4. Add karein: `http://192.168.16.102:3000`
5. Enable karein
6. Chrome restart karein

### iOS Safari:
iOS Safari HTTP par microphone allow nahi karta. Aapko HTTPS ya ngrok use karna HOGA.

---

## Important Notes

⚠️ **Ye SIRF TESTING ke liye hai!**
- Production mein use mat karein
- Security kam ho jati hai
- Sirf aapke browser ko affect karta hai
- Har device par karna padega

Production ke liye use karein:
- HTTPS (Vercel)
- ngrok
- Proper SSL certificate

---

## Setup Ke Baad

Test karein: `http://192.168.16.102:3000/test-call`

Ab aap kar sakte hain:
1. Microphone permission de sakte hain
2. Calls kar sakte hain
3. Audio sun sakte hain

---

## Agar Kaam Na Kare

### Phir Bhi Kaam Nahi Kar Raha?

1. **Browser completely restart karein** (sab windows band karein)
2. **Site permissions clear karein**: 
   - Chrome: Settings → Privacy → Site Settings → Microphone
   - `http://192.168.16.102:3000` remove karein
   - Phir se try karein
3. **Flag check karein**: `chrome://flags` par jayein aur verify karein

### Permission Popup Nahi Aa Raha?

1. Address bar mein 🔒 ya ⓘ icon par click karein
2. "Site settings" par click karein
3. Microphone ko "Allow" par set karein
4. Page refresh karein

---

## Step by Step (Asan Tarika)

### Chrome Ke Liye:

1. **Chrome kholen**
2. **Address bar mein paste karein**: 
   ```
   chrome://flags/#unsafely-treat-insecure-origin-as-secure
   ```
3. **Enter dabayein**
4. **Field mein apna URL type karein**:
   ```
   http://192.168.16.102:3000
   ```
5. **Dropdown mein "Enabled" select karein**
6. **Neeche "Relaunch" button dabayein**
7. **Chrome restart hoga**
8. **Test karein**: `http://192.168.16.102:3000/test-call`
9. **Microphone permission dein jab puche**
10. **Call karein - kaam karega!** ✅

---

**TL;DR**:
1. `chrome://flags/#unsafely-treat-insecure-origin-as-secure`
2. Add: `http://192.168.16.102:3000`
3. Enable
4. Relaunch
5. Test karein!

**Yaad Rakhein**: Ye sirf testing ke liye hai. Production mein HTTPS use karein!
