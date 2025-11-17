# Quick Fix: Allow HTTP Microphone in Chrome

## Do This Now (30 Seconds):

### 1. Copy This:
```
chrome://flags/#unsafely-treat-insecure-origin-as-secure
```

### 2. Paste in Chrome Address Bar
Press Enter

### 3. In the Field, Type:
```
http://192.168.16.102:3000
```

### 4. Change Dropdown to:
```
Enabled
```

### 5. Click:
```
Relaunch
```

### 6. Test:
```
http://192.168.16.102:3000/test-call
```

## Done! ✅

Microphone will now work on HTTP.

---

## Visual Steps:

```
Step 1: Chrome Address Bar
┌─────────────────────────────────────────────────┐
│ chrome://flags/#unsafely-treat-insecure-ori... │ ← Paste this
└─────────────────────────────────────────────────┘

Step 2: Find the Setting
┌─────────────────────────────────────────────────┐
│ Insecure origins treated as secure             │
│ ┌─────────────────────────────────────────────┐ │
│ │ http://192.168.16.102:3000                  │ │ ← Type your URL
│ └─────────────────────────────────────────────┘ │
│ [Default ▼] → Change to [Enabled ▼]            │ ← Enable
└─────────────────────────────────────────────────┘

Step 3: Restart
┌─────────────────────────────────────────────────┐
│ Your changes will take effect the next time    │
│ you relaunch Chrome.                            │
│                                                 │
│                              [Relaunch] ← Click │
└─────────────────────────────────────────────────┘
```

---

## For Other Devices:

Do the same on:
- Each phone
- Each laptop
- Each tablet

You need to enable it on **every device** you test with.

---

## Troubleshooting:

### Still Not Working?

1. **Close ALL Chrome windows**
2. **Open Chrome again**
3. **Go to**: `chrome://flags/#unsafely-treat-insecure-origin-as-secure`
4. **Verify** it says "Enabled"
5. **Try again**

### Permission Not Asking?

1. Click 🔒 in address bar
2. Click "Site settings"
3. Set Microphone to "Allow"
4. Refresh page

---

## Remember:

⚠️ **This is for TESTING only!**

For production, use:
- Vercel (automatic HTTPS)
- ngrok (temporary HTTPS)

---

**TL;DR**: 
Paste `chrome://flags/#unsafely-treat-insecure-origin-as-secure` → Add your URL → Enable → Relaunch → Test!
