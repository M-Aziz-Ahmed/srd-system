# Mongoose Schema Fix - Urdu Guide

## Kya Error Aa Raha Tha?

```
Error: Message validation failed: attachments.0: Cast to [string] failed
```

Matlab: Voice message save nahi ho raha tha database mein.

## Problem Kya Thi?

Message model mein attachments ka schema galat tha.

### Pehle (GALAT):
```javascript
attachments: [{
  type: String,        // ❌ Ye galat hai
  url: String,
  mimeType: String,
  size: Number,
}]
```

**Problem**: Mongoose mein `type` ek special keyword hai. Jab aap seedha `type: String` likhte hain, toh Mongoose samajhta hai ke pura array element String type ka hai, na ke ek field jiska naam "type" hai.

### Ab (SAHI):
```javascript
attachments: [{
  type: {              // ✅ Sahi tarika
    type: String,      // ✅ Ab Mongoose samajh jayega
    default: 'audio'
  },
  url: String,
  mimeType: String,
  size: Number,
}]
```

## Kyun Hota Hai Ye?

Mongoose mein `type` keyword ka special matlab hai. Jab aap likhte hain:

```javascript
{
  type: String
}
```

Toh Mongoose samajhta hai: "Ye field String type ka hai"

Lekin agar aapko ek field chahiye jiska **naam** "type" ho, toh aapko aise likhna padega:

```javascript
{
  type: {
    type: String
  }
}

// Matlab:
// - Bahar wala "type" = field ka naam
// - Andar wala "type" = field ka data type
```

## Kya Fix Kiya?

**File**: `src/models/Message.js`

**Change**:
```javascript
// PEHLE - Error deta tha
attachments: [{
  type: String,
  url: String,
  mimeType: String,
  size: Number,
}]

// AB - Sahi kaam karega
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

## Test Kaise Karein?

Is fix ke baad voice message aise save hoga:

```javascript
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

## MongoDB Mein Check Karein

```javascript
// MongoDB mein ye command chalayein:
db.messages.findOne({ isVoice: true })

// Ye dikhna chahiye:
{
  _id: ObjectId("..."),
  content: "🎤 Voice message",
  isVoice: true,
  attachments: [
    {
      type: "audio",                                    // ✅ Sahi
      url: "/assets/voice-chats/voice_123.webm",       // ✅ Sahi
      mimeType: "audio/webm",                          // ✅ Sahi
      size: 70271                                       // ✅ Sahi
    }
  ]
}
```

## Deploy Kaise Karein?

```bash
git add src/models/Message.js
git commit -m "Fix: Mongoose schema attachments type field"
git push
```

## Kaise Pata Chalega Ke Fix Ho Gaya?

Deploy karne ke baad:

✅ Voice message bina error ke send hoga  
✅ Console mein "Cast to [string] failed" error nahi aayega  
✅ MongoDB mein attachments sahi save honge  
✅ Audio player properly dikhega  

## Quick Test

1. Voice message record karein
2. Send karein
3. **Dekhna Chahiye**: 
   - ✅ "Voice message sent" toast dikhe
   - ✅ Audio player dikhe
   - ✅ Console mein koi error na ho

4. **Nahi Dekhna Chahiye**:
   - ❌ "Message validation failed" error
   - ❌ "Cast to [string] failed" error

## Common Mongoose Mistakes

### Mistake 1: Reserved Keywords
```javascript
// GALAT
{
  type: String,
  default: String,
  required: Boolean
}

// SAHI
{
  type: { type: String },
  default: { type: String },
  required: { type: Boolean }
}
```

### Mistake 2: Nested Objects
```javascript
// GALAT - Mongoose confuse ho jayega
{
  metadata: {
    type: String,
    size: Number
  }
}

// SAHI - Clear definition
{
  metadata: {
    type: {
      type: String
    },
    size: Number
  }
}
```

## Summary

**Problem**: `type` field directly define kiya tha  
**Solution**: `type` ko properly nest kiya  
**Result**: Voice messages ab sahi save honge  

---

**Status**: ✅ Fix ho gaya! Deploy karein aur test karein!

Ab voice messages properly kaam karengi. File upload bhi hogi aur database mein bhi sahi save hoga.
