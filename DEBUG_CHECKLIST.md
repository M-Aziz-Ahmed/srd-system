# Debug Checklist for Vercel Issues

## Voice Clips Not Showing/Playing

### Check 1: Is the message saving correctly?
```javascript
// Open browser console on sender side after sending voice message
// You should see:
console.log('Audio blob created:', audioBlob.size, 'bytes')
console.log('Voice message sent')
```

### Check 2: Is the attachment in the database?
1. Go to MongoDB Atlas
2. Open your database → Messages collection
3. Find the latest message
4. Check if it has:
   - `isVoice: true`
   - `attachments: [{ type: 'audio', url: 'data:audio/webm;base64,...' }]`

### Check 3: Is it rendering on receiver side?
```javascript
// Open browser console on receiver side
// You should see:
console.log('Voice message detected:', {
  isVoice: true,
  hasAttachments: true,
  attachmentsLength: 1
})
```

### Fix if not working:
- Clear browser cache
- Check if MongoDB connection is stable
- Verify message API is receiving attachments field
- Check browser console for "Audio playback error"

---

## WebRTC Calls Silent

### Check 1: Are tracks being added?
```javascript
// Open browser console when starting call
// You should see:
console.log('Adding local track:', 'audio', true)
console.log('Adding local track:', 'video', true) // if video call
```

### Check 2: Are tracks being received?
```javascript
// Open browser console on both sides
// You should see:
console.log('Received remote track:', 'audio', 'enabled:', true)
console.log('Remote stream playing successfully')
```

### Check 3: Connection state
```javascript
// You should see:
console.log('Connection state:', 'connected')
console.log('ICE connection state:', 'connected')
```

### Fix if not working:

#### If you see "Connection state: failed"
- Network is blocking WebRTC
- Need TURN servers (see below)

#### If you see "Received remote track" but no audio
- Check browser audio output device
- Check if remote video element exists
- Try: `remoteVideoRef.current.volume = 1.0`

#### If ICE connection stuck on "checking"
- Firewall blocking UDP
- Need TURN servers

### Adding TURN Servers (for strict networks):

1. Sign up for free TURN service:
   - Twilio: https://www.twilio.com/stun-turn
   - Xirsys: https://xirsys.com/

2. Update configuration in `src/app/inbox/page.js`:
```javascript
const configuration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { 
      urls: 'turn:your-turn-server.com:3478',
      username: 'your-username',
      credential: 'your-password'
    }
  ],
  iceCandidatePoolSize: 10,
};
```

---

## Online Status Not Updating

### Check 1: Is status API working?
Test in browser console:
```javascript
fetch('/api/users/status', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ status: 'online' })
}).then(r => r.json()).then(console.log)

// Should return: { success: true, data: { status: 'online', lastSeen: '...' } }
```

### Check 2: Is Pusher connected?
```javascript
// Open browser console
// You should see:
console.log('Pusher connected')
console.log('Status change:', { email: '...', status: 'online' })
```

### Check 3: Is MongoDB saving status?
1. Go to MongoDB Atlas
2. Open Users collection
3. Check if users have:
   - `onlineStatus: 'online'` or 'offline' or 'away'
   - `lastSeen: ISODate(...)`

### Fix if not working:

#### If Pusher not connecting:
1. Check Vercel environment variables
2. Verify Pusher credentials in Pusher dashboard
3. Check Pusher dashboard → Debug Console for events

#### If status not saving to MongoDB:
1. Check MongoDB connection in Vercel logs
2. Verify User model has `onlineStatus` field
3. Try redeploying to update schema

#### If status saving but not showing in UI:
1. Check if `userStatuses` state is updating
2. Verify Pusher channel subscription: `pusher.subscribe('presence')`
3. Check if status-change event is being received

---

## General Debugging Commands

### Check Vercel Logs:
```bash
vercel logs --follow
```

### Check MongoDB Connection:
```bash
# In Vercel logs, look for:
"MongoDB connected successfully"
```

### Check Pusher Events:
1. Go to Pusher Dashboard
2. Click your app
3. Go to "Debug Console"
4. Should see events like:
   - `new-message`
   - `status-change`
   - `call-offer`
   - `call-answer`

### Test Pusher from Browser Console:
```javascript
// Check if Pusher is loaded
console.log(window.Pusher)

// Check active channels
pusherRef.current.allChannels()
```

---

## Common Issues & Quick Fixes

### Issue: "Microphone access denied"
**Fix**: Grant microphone permission in browser settings

### Issue: "Audio element not found"
**Fix**: Check if `remoteVideoRef` is properly initialized

### Issue: "Pusher connection failed"
**Fix**: Check Pusher credentials and cluster setting

### Issue: "MongoDB connection timeout"
**Fix**: Check if MongoDB Atlas allows connections from Vercel IPs (0.0.0.0/0)

### Issue: "Voice message shows but audio is corrupted"
**Fix**: Check MIME type compatibility (use audio/webm for Chrome, audio/mp4 for Safari)

### Issue: "Call connects but drops after 30 seconds"
**Fix**: Need TURN servers for NAT traversal

---

## Browser Compatibility

### Voice Messages:
- ✅ Chrome/Edge: audio/webm
- ✅ Firefox: audio/ogg
- ✅ Safari: audio/mp4
- ⚠️ Mobile browsers: May need user interaction to play

### WebRTC Calls:
- ✅ Chrome/Edge: Full support
- ✅ Firefox: Full support
- ✅ Safari: Full support (iOS 11+)
- ⚠️ Some corporate networks block WebRTC

### Online Status:
- ✅ All modern browsers
- ⚠️ Requires Pusher connection

---

## Performance Optimization

### For Voice Messages:
Current: Base64 in MongoDB (works but not optimal)

Better: Use cloud storage
```javascript
// Upload to Vercel Blob or S3
const { url } = await upload(audioBlob);
// Save URL instead of base64
```

### For WebRTC:
Current: STUN only (works for most users)

Better: Add TURN servers (works for all users)

### For Online Status:
Current: Update on page load/unload (works but basic)

Better: Add heartbeat every 30 seconds
```javascript
setInterval(() => {
  updateOnlineStatus('online');
}, 30000);
```

---

## Testing Checklist

Before marking as "working":

- [ ] Voice message sends and plays on receiver side
- [ ] Voice message shows waveform/player controls
- [ ] Voice call connects within 5 seconds
- [ ] Both parties can hear each other clearly
- [ ] Video call shows both video streams
- [ ] Online status shows green when user is active
- [ ] Status changes to yellow when tab is hidden
- [ ] Status changes to gray when user logs out
- [ ] Status updates in real-time (no refresh needed)
- [ ] No console errors related to audio/Pusher/MongoDB

---

## Still Having Issues?

1. Check all environment variables in Vercel
2. Check Vercel function logs for errors
3. Check Pusher Debug Console for event delivery
4. Check MongoDB Atlas for connection issues
5. Test on different browsers/networks
6. Consider adding TURN servers for WebRTC

## Success Criteria

✅ Voice clips play immediately after receiving  
✅ Calls have clear audio within 3 seconds  
✅ Status dots update without page refresh  
✅ No errors in browser console  
✅ Works on different browsers and networks  
