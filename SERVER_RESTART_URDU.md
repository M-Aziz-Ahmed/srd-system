# Development Server Restart Karein - Zaroori!

## Kyun Restart Karna Hai?

Mongoose model ka schema update ho gaya hai, lekin Node.js purane model ko memory mein cache kar ke rakha hai. Naya schema load karne ke liye server restart karna zaroori hai.

## Kaise Restart Karein?

### Tarika 1: Terminal Restart
1. Apne terminal mein jahan `npm run dev` chal raha hai
2. `Ctrl + C` dabayein server band karne ke liye
3. Phir se `npm run dev` chalayein
4. "Ready" message ka wait karein

### Tarika 2: Force Kill aur Restart
```bash
# Windows
taskkill /F /IM node.exe
npm run dev

# Mac/Linux
killall node
npm run dev
```

### Tarika 3: Terminal Band Karke Naya Kholen
1. Terminal completely band kar dein
2. Naya terminal kholen
3. Project folder mein jayein
4. `npm run dev` chalayein

## Kya Change Hua?

### Message Model Schema Fix:
```javascript
// PEHLE (Error deta tha)
attachments: [{
  type: String,        // ❌ Mongoose confuse ho jata tha
  url: String,
  mimeType: String,
  size: Number,
}]

// AB (Sahi hai)
attachments: [{
  type: {              // ✅ Properly nested
    type: String,
    default: 'audio'
  },
  url: String,
  mimeType: String,
  size: Number,
}]
```

### Model Force Reload:
```javascript
// Ye add kiya force reload ke liye
if (mongoose.models.Message) {
  delete mongoose.models.Message;
}
```

## Restart Ke Baad

Voice message phir se test karein:
1. Voice message record karein
2. Send karein
3. Console logs check karein - ye dikhna chahiye:
   ```
   ✅ Attachments received: [{ type: 'audio', url: '...', ... }]
   ✅ Attachments type: object
   ✅ Is array: true
   ✅ Message data to save: { ... }
   ✅ Voice message sent
   ```

## Agar Phir Bhi Error Aaye

### Check 1: Server Sach Mein Restart Hua?
Terminal mein ye dikhna chahiye:
```
✓ Compiled in XXXms
○ Compiling /api/messages ...
✓ Compiled /api/messages in XXXms
```

### Check 2: Next.js Cache Clear Karein
```bash
# Pehle server band karein (Ctrl+C)
rm -rf .next
npm run dev
```

### Check 3: Node Modules Check Karein
```bash
# Dependencies phir se install karein
rm -rf node_modules
npm install
npm run dev
```

## Verification

Restart ke baad error nahi aana chahiye:

### Pehle (Error):
```
❌ Error: Message validation failed: attachments.0: Cast to [string] failed
```

### Baad Mein (Success):
```
✅ POST /api/upload-audio 200 in 11ms
✅ Attachments received: [...]
✅ Message data to save: {...}
✅ POST /api/messages 200 in 50ms
✅ Voice message sent
```

## Production Ke Liye (Vercel)

Jab aap Vercel par deploy karte hain, wo automatically naya schema use karta hai. Restart ki zaroorat nahi.

```bash
git add .
git commit -m "Fix: Mongoose schema for attachments"
git push
```

Vercel automatically naye schema ke saath build karega.

## Quick Commands

```bash
# Server band karein
Ctrl + C

# Cache clear karke restart
rm -rf .next
npm run dev

# Ya bas restart
npm run dev
```

## Step by Step (Asan Tarika)

1. **Terminal Dekhen**: Jahan `npm run dev` chal raha hai
2. **Ctrl + C Dabayein**: Server band ho jayega
3. **Wait Karein**: 2-3 seconds
4. **Type Karein**: `npm run dev`
5. **Enter Dabayein**: Server start hoga
6. **Wait Karein**: "Ready" dikhe
7. **Test Karein**: Voice message bhejein

## Console Mein Kya Dikhega?

### Successful Restart:
```
> npm run dev

> your-app@0.1.0 dev
> next dev

  ▲ Next.js 14.x.x
  - Local:        http://localhost:3000

 ✓ Ready in 2.5s
```

### Successful Voice Message:
```
POST /api/upload-audio 200 in 11ms
Attachments received: [
  {
    "type": "audio",
    "url": "/assets/voice-chats/voice_123.webm",
    "mimeType": "audio/webm",
    "size": 85855
  }
]
Attachments type: object
Is array: true
Message data to save: {...}
POST /api/messages 200 in 50ms
```

## Important Notes

- ✅ Har baar Mongoose schema change karne par restart zaroori hai
- ✅ Vercel par deploy karne par automatic reload hota hai
- ✅ Development mein manual restart karna padta hai
- ✅ Cache clear karna bhi help karta hai

## Agar Kuch Samajh Na Aaye

1. Terminal band kar dein
2. Naya terminal kholen
3. Project folder mein jayein: `cd your-project-folder`
4. Server chalayein: `npm run dev`
5. Browser refresh karein: `Ctrl + Shift + R`
6. Voice message test karein

---

**Yaad Rakhein**: Schema change ke baad hamesha server restart karein!

Restart karne ke baad voice messages properly kaam karengi. Error nahi aayega aur files sahi save hongi.
