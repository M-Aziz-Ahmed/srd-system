# Quick Reference Card

## 🚀 Deploy Now
```bash
git add .
git commit -m "Fix voice clips, WebRTC audio, and online status"
git push
```

## ✅ What's Fixed

| Issue | Status | What Changed |
|-------|--------|--------------|
| Voice clips not showing | ✅ Fixed | Messages API now saves attachments |
| WebRTC calls silent | ✅ Fixed | Better STUN config + audio handling |
| Everyone shows online | ✅ Fixed | Real-time status tracking added |

## 📋 Test Checklist

### Voice Messages (2 min)
- [ ] Click microphone button
- [ ] Record 3-5 seconds
- [ ] Send message
- [ ] Audio player appears
- [ ] Audio plays when clicked

### WebRTC Calls (3 min)
- [ ] Click phone icon
- [ ] Other user receives call
- [ ] Accept call
- [ ] Both hear each other
- [ ] Mute button works

### Online Status (1 min)
- [ ] Green dot = online
- [ ] Yellow dot = away (hide tab)
- [ ] Gray dot = offline (close tab)
- [ ] Updates without refresh

## 🔧 Files Changed

```
src/app/inbox/page.js              ← Main chat UI
src/app/api/messages/route.js      ← Message saving
src/models/User.js                 ← User schema
src/app/api/users/status/route.js  ← Status API (NEW)
```

## 🌐 Environment Variables

Check Vercel has these:
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `MONGODB_URI`
- `PUSHER_APP_ID`
- `NEXT_PUBLIC_PUSHER_KEY`
- `PUSHER_SECRET`
- `NEXT_PUBLIC_PUSHER_CLUSTER`

## 🐛 If Issues Persist

### Voice clips not playing:
1. Check MongoDB has `attachments` field
2. Check browser console for errors
3. Try different browser

### Calls have no audio:
1. Check microphone permissions
2. Check Pusher events in dashboard
3. Try different network
4. Consider adding TURN servers

### Status not updating:
1. Check Pusher credentials
2. Check MongoDB has `onlineStatus` field
3. Hard refresh browser

## 📚 Documentation

- `FIXES_SUMMARY.md` - Detailed overview
- `VERCEL_FIXES.md` - Technical details
- `DEBUG_CHECKLIST.md` - Troubleshooting
- `DEPLOY_NOW.md` - Deployment guide

## 🎯 Success Indicators

✅ Audio player with waveform  
✅ Clear audio in calls  
✅ Colored status dots  
✅ No console errors  

## 💡 Pro Tips

1. **Voice Messages**: Works best in Chrome/Edge
2. **WebRTC**: Grant mic permissions when prompted
3. **Status**: Updates automatically via Pusher
4. **Testing**: Use 2 browsers or devices

## 🔗 Quick Links

- Vercel Dashboard: https://vercel.com/dashboard
- Pusher Dashboard: https://dashboard.pusher.com/
- MongoDB Atlas: https://cloud.mongodb.com/

## 📞 Support

If stuck, check:
1. Vercel logs: `vercel logs --follow`
2. Pusher Debug Console
3. Browser console (F12)
4. MongoDB connection status

---

**Ready to deploy!** 🚀
