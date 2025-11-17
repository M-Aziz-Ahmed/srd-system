# Allow HTTP Microphone Access in Chrome (Testing Only)

## Chrome Flag Method

### Step 1: Open Chrome Flags
```
chrome://flags/#unsafely-treat-insecure-origin-as-secure
```

### Step 2: Add Your URL
In the field, add:
```
http://192.168.16.102:3000
```

### Step 3: Enable
Set the dropdown to **"Enabled"**

### Step 4: Restart Chrome
Click "Relaunch" button at the bottom

### Step 5: Test
Go to: `http://192.168.16.102:3000/test-call`

Microphone should now work!

---

## Alternative: Chrome Command Line

### Windows:
Close Chrome completely, then run:
```cmd
"C:\Program Files\Google\Chrome\Application\chrome.exe" --unsafely-treat-insecure-origin-as-secure="http://192.168.16.102:3000" --user-data-dir=C:\temp\chrome-test
```

### Mac:
```bash
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --unsafely-treat-insecure-origin-as-secure="http://192.168.16.102:3000" --user-data-dir=/tmp/chrome-test
```

### Linux:
```bash
google-chrome --unsafely-treat-insecure-origin-as-secure="http://192.168.16.102:3000" --user-data-dir=/tmp/chrome-test
```

---

## Firefox Method

### Step 1: Open Config
```
about:config
```

### Step 2: Accept Warning
Click "Accept the Risk and Continue"

### Step 3: Search
Search for: `media.devices.insecure.enabled`

### Step 4: Enable
Set to **true**

### Step 5: Search Again
Search for: `media.getusermedia.insecure.enabled`

### Step 6: Enable
Set to **true**

### Step 7: Test
Go to: `http://192.168.16.102:3000/test-call`

---

## Edge Method

Same as Chrome - use:
```
edge://flags/#unsafely-treat-insecure-origin-as-secure
```

Add: `http://192.168.16.102:3000`

Enable and restart.

---

## Quick Chrome Setup (Copy-Paste)

1. Open new tab
2. Paste: `chrome://flags/#unsafely-treat-insecure-origin-as-secure`
3. In the field, paste: `http://192.168.16.102:3000`
4. Change dropdown to "Enabled"
5. Click "Relaunch"
6. Done!

---

## For Mobile Testing

### Android Chrome:
1. Open Chrome
2. Go to: `chrome://flags`
3. Search: "insecure origins"
4. Add: `http://192.168.16.102:3000`
5. Enable
6. Restart Chrome

### iOS Safari:
iOS Safari doesn't allow HTTP microphone access. You MUST use HTTPS or ngrok.

---

## Important Notes

⚠️ **This is for TESTING ONLY!**
- Don't use in production
- Reduces security
- Only affects your browser
- Need to do on each device

For production, use:
- HTTPS (Vercel)
- ngrok
- Proper SSL certificate

---

## After Setup

Test at: `http://192.168.16.102:3000/test-call`

You should now be able to:
1. Grant microphone permission
2. Make calls
3. Hear audio

---

## Troubleshooting

### Still Not Working?

1. **Restart browser completely** (close all windows)
2. **Clear site permissions**: 
   - Chrome: Settings → Privacy → Site Settings → Microphone
   - Remove `http://192.168.16.102:3000`
   - Try again
3. **Check flag is enabled**: Go back to `chrome://flags` and verify

### Permission Popup Not Showing?

1. Click the 🔒 or ⓘ icon in address bar
2. Click "Site settings"
3. Set Microphone to "Allow"
4. Refresh page

---

**TL;DR for Chrome**:
1. `chrome://flags/#unsafely-treat-insecure-origin-as-secure`
2. Add: `http://192.168.16.102:3000`
3. Enable
4. Relaunch
5. Test!
