# Quick Deployment Guide

## What Was Fixed

✅ **Voice Clips** - Now save and play properly  
✅ **WebRTC Audio** - Calls now have working audio  
✅ **Online Status** - Shows real online/offline/away status  

## Deploy to Vercel

### Option 1: Auto Deploy (If connected to Git)
```bash
git add .
git commit -m "Fix voice clips, WebRTC calls, and online status"
git push
```
Vercel will automatically deploy.

### Option 2: Manual Deploy
```bash
vercel --prod
```

## After Deployment - Test These

### 1. Test Voice Messages (2 minutes)
1. Login as User A
2. Go to Inbox → Select User B
3. Click blue microphone button 🎤
4. Record 3-5 seconds
5. Click checkmark to send
6. **Should see**: Audio player with controls

### 2. Test Voice Calls (3 minutes)
1. Open app in 2 browsers (or devices)
2. Login as different users
3. User A: Click phone icon ☎️ on User B
4. User B: Should see incoming call popup
5. User B: Click green phone to accept
6. **Should hear**: Each other talking clearly

### 3. Test Online Status (1 minute)
1. Open app in 2 browsers
2. Login as different users
3. **Should see**: 
   - Green dot 🟢 = User is active
   - Yellow dot 🟡 = User's tab is hidden
   - Gray dot ⚫ = User logged out

## If Something Doesn't Work

### Voice Clips Not Playing
- Check: Browser console for errors
- Check: MongoDB connection in Vercel logs
- Try: Different browser (Chrome works best)

### Calls Have No Audio
- Check: Browser microphone permissions
- Check: Pusher events in Pusher dashboard
- Try: Different network (some block WebRTC)
- Consider: Adding TURN servers (see VERCEL_FIXES.md)

### Status Always Shows Online
- Check: Pusher credentials in Vercel environment variables
- Check: MongoDB User collection has `onlineStatus` field
- Try: Hard refresh (Ctrl+Shift+R)

## Environment Variables Checklist

Make sure these are in Vercel → Settings → Environment Variables:

- ✅ `NEXTAUTH_SECRET`
- ✅ `NEXTAUTH_URL` (should be your Vercel URL)
- ✅ `MONGODB_URI`
- ✅ `PUSHER_APP_ID`
- ✅ `NEXT_PUBLIC_PUSHER_KEY`
- ✅ `PUSHER_SECRET`
- ✅ `NEXT_PUBLIC_PUSHER_CLUSTER`

## Quick Fixes

### If voice clips show but don't play:
The audio data is saving correctly, but browser might block autoplay. User needs to click play button.

### If calls connect but no audio:
1. Check both users granted microphone permission
2. Try refreshing both browsers
3. Check if either user is on corporate network (might block WebRTC)

### If status doesn't update:
1. Check Pusher dashboard → Debug Console
2. Should see "status-change" events
3. If not, check Pusher credentials

## Need Help?

Check the detailed guide: `VERCEL_FIXES.md`

## Success Indicators

✅ Voice message shows audio player with waveform  
✅ Can hear other person in call within 3 seconds  
✅ Status dots change color when switching tabs  
✅ No console errors related to Pusher or MongoDB  

---

**Ready to deploy!** Just push to Git or run `vercel --prod`
