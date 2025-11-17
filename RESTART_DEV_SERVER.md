# Restart Development Server - Important!

## Why Restart?

The Mongoose model schema was updated, but Node.js caches the old model in memory. You need to restart the development server to load the new schema.

## How to Restart

### Option 1: Terminal Restart
1. Go to your terminal where `npm run dev` is running
2. Press `Ctrl + C` to stop the server
3. Run `npm run dev` again
4. Wait for "Ready" message

### Option 2: Kill and Restart
```bash
# Windows
taskkill /F /IM node.exe
npm run dev

# Mac/Linux
killall node
npm run dev
```

### Option 3: Close and Reopen Terminal
1. Close the terminal completely
2. Open a new terminal
3. Navigate to project folder
4. Run `npm run dev`

## What Changed?

### Message Model Schema Fix:
```javascript
// OLD (Caused error)
attachments: [{
  type: String,        // ❌ Mongoose confused this
  url: String,
  mimeType: String,
  size: Number,
}]

// NEW (Fixed)
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

### Model Reload Force:
```javascript
// Added this to force reload
if (mongoose.models.Message) {
  delete mongoose.models.Message;
}
```

## After Restart

Test voice message again:
1. Record voice message
2. Send it
3. Check console logs - should see:
   ```
   ✅ Attachments received: [{ type: 'audio', url: '...', ... }]
   ✅ Attachments type: object
   ✅ Is array: true
   ✅ Message data to save: { ... }
   ✅ Voice message sent
   ```

## If Still Getting Error

### Check 1: Server Actually Restarted?
Look for this in terminal:
```
✓ Compiled in XXXms
○ Compiling /api/messages ...
✓ Compiled /api/messages in XXXms
```

### Check 2: Clear Next.js Cache
```bash
# Stop server first (Ctrl+C)
rm -rf .next
npm run dev
```

### Check 3: Check Node Modules
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
npm run dev
```

## Verification

After restart, the error should be gone:

### Before (Error):
```
❌ Error: Message validation failed: attachments.0: Cast to [string] failed
```

### After (Success):
```
✅ POST /api/upload-audio 200 in 11ms
✅ Attachments received: [...]
✅ Message data to save: {...}
✅ POST /api/messages 200 in 50ms
✅ Voice message sent
```

## For Production (Vercel)

When you deploy to Vercel, it automatically uses the new schema. No restart needed.

```bash
git add .
git commit -m "Fix: Mongoose schema for attachments"
git push
```

Vercel will build with the new schema automatically.

## Quick Commands

```bash
# Stop server
Ctrl + C

# Clear cache and restart
rm -rf .next
npm run dev

# Or just restart
npm run dev
```

---

**Important**: Always restart dev server after changing Mongoose schemas!
