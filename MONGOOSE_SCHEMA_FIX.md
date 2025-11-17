# Mongoose Schema Fix - Attachments Error

## The Error

```
Error: Message validation failed: attachments.0: Cast to [string] failed
```

## Root Cause

The Message model had an incorrect schema for attachments:

### Before (WRONG):
```javascript
attachments: [{
  type: String,        // ❌ This conflicts with Mongoose's reserved 'type' keyword
  url: String,
  mimeType: String,
  size: Number,
}]
```

When you define `type: String` directly in a subdocument, Mongoose thinks you're defining the type of the entire array element, not a field called "type".

### After (CORRECT):
```javascript
attachments: [{
  type: {              // ✅ Properly nested
    type: String,      // ✅ Now Mongoose knows this is a field
    default: 'audio'
  },
  url: String,
  mimeType: String,
  size: Number,
}]
```

## Why This Happens

In Mongoose, `type` is a reserved keyword used to define the data type of a field. When you write:

```javascript
{
  type: String
}
```

Mongoose interprets this as "this field is a String", not "this field is named 'type' and has value String".

To have a field actually named "type", you must nest it:

```javascript
{
  type: {
    type: String
  }
}
```

## The Fix

**File**: `src/models/Message.js`

**Changed**:
```javascript
// OLD - Caused error
attachments: [{
  type: String,
  url: String,
  mimeType: String,
  size: Number,
}]

// NEW - Works correctly
attachments: [{
  type: {
    type: String,
    default: 'audio'
  },
  url: String,
  mimeType: String,
  size: Number,
}]
```

## Testing

After this fix, voice messages should save correctly:

```javascript
// This will now work:
{
  attachments: [
    {
      type: 'audio',
      url: '/assets/voice-chats/voice_123.webm',
      mimeType: 'audio/webm',
      size: 70271
    }
  ]
}
```

## Verification

Check in MongoDB that messages are saving with proper structure:

```javascript
db.messages.findOne({ isVoice: true })

// Should return:
{
  _id: ObjectId("..."),
  content: "🎤 Voice message",
  isVoice: true,
  attachments: [
    {
      type: "audio",
      url: "/assets/voice-chats/voice_123.webm",
      mimeType: "audio/webm",
      size: 70271
    }
  ],
  // ... other fields
}
```

## Deploy

```bash
git add src/models/Message.js
git commit -m "Fix: Mongoose schema for attachments type field"
git push
```

## Success Indicators

After deploying:

✅ Voice messages send without errors  
✅ No "Cast to [string] failed" error  
✅ Attachments save correctly in MongoDB  
✅ Audio player displays properly  

---

**Status**: ✅ Fixed and ready to deploy!
