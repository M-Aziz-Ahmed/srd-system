# WebRTC Call Setup Guide

## Quick Start

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Open the call test page:**
   - Navigate to: `http://localhost:3000/call-test`
   - This page includes diagnostics and testing tools

3. **Test the call functionality:**
   - Open 2 browser windows/tabs
   - Login as different users in each
   - Use the call test interface to make calls

## System Requirements

### ✅ Browser Support
- Chrome 60+ (recommended)
- Firefox 55+
- Safari 11+
- Edge 79+

### ✅ Permissions Required
- **Microphone access** - Required for voice calls
- **HTTPS** - Required in production (localhost works with HTTP)

### ✅ Network Requirements
- **STUN servers** - For same-network calls
- **TURN servers** - For cross-network calls (configured automatically)

## Troubleshooting

### Common Issues

#### 1. "Microphone access denied"
**Solution:**
- Click the microphone icon in browser address bar
- Select "Allow" for microphone access
- Refresh the page and try again

#### 2. "Call not connecting"
**Possible causes:**
- Firewall blocking WebRTC traffic
- Network restrictions (corporate networks)
- TURN servers not accessible

**Solutions:**
- Try on different networks
- Check browser console for detailed errors
- Ensure both users have microphone access

#### 3. "No audio heard"
**Solutions:**
- Check system volume levels
- Try different browsers
- Check if audio is muted in call controls
- Verify microphone is working in other apps

#### 4. "Pusher connection failed"
**Solutions:**
- Check internet connection
- Verify Pusher credentials in `.env` file
- Check browser console for Pusher errors

### Network Diagnostics

The call test page (`/call-test`) includes built-in diagnostics that check:
- WebRTC browser support
- Microphone access
- HTTPS/secure context
- Pusher real-time connection

## HTTPS Setup for Production

WebRTC requires HTTPS in production. For local HTTPS testing:

### Option 1: Using mkcert (Recommended)

1. **Install mkcert:**
   ```bash
   # Windows (using Chocolatey)
   choco install mkcert
   
   # macOS (using Homebrew)
   brew install mkcert
   
   # Linux
   sudo apt install libnss3-tools
   wget -O mkcert https://github.com/FiloSottile/mkcert/releases/download/v1.4.4/mkcert-v1.4.4-linux-amd64
   chmod +x mkcert
   sudo mv mkcert /usr/local/bin/
   ```

2. **Create local CA:**
   ```bash
   mkcert -install
   ```

3. **Generate certificates:**
   ```bash
   mkcert localhost 127.0.0.1 ::1
   ```

4. **Update Next.js to use HTTPS:**
   Create `server.js`:
   ```javascript
   const { createServer } = require('https');
   const { parse } = require('url');
   const next = require('next');
   const fs = require('fs');

   const dev = process.env.NODE_ENV !== 'production';
   const app = next({ dev });
   const handle = app.getRequestHandler();

   const httpsOptions = {
     key: fs.readFileSync('./localhost-key.pem'),
     cert: fs.readFileSync('./localhost.pem'),
   };

   app.prepare().then(() => {
     createServer(httpsOptions, (req, res) => {
       const parsedUrl = parse(req.url, true);
       handle(req, res, parsedUrl);
     }).listen(3000, (err) => {
       if (err) throw err;
       console.log('> Ready on https://localhost:3000');
     });
   });
   ```

5. **Update package.json:**
   ```json
   {
     "scripts": {
       "dev": "node server.js",
       "dev:http": "next dev"
     }
   }
   ```

### Option 2: Using ngrok (Quick Testing)

1. **Install ngrok:**
   - Download from https://ngrok.com/
   - Or use npm: `npm install -g ngrok`

2. **Start your app:**
   ```bash
   npm run dev
   ```

3. **Create HTTPS tunnel:**
   ```bash
   ngrok http 3000
   ```

4. **Use the HTTPS URL provided by ngrok**

## Architecture Overview

### Components
- **SimpleCall.js** - Main WebRTC call component
- **Call Test Page** - Diagnostics and testing interface
- **WebRTC API** - Server-side signaling endpoints

### Signaling Flow
1. User A calls User B
2. Offer sent via Pusher to User B
3. User B accepts and sends answer
4. ICE candidates exchanged
5. Direct peer-to-peer connection established
6. Audio streams flow directly between users

### TURN/STUN Servers
- **STUN** - Discovers public IP for same-network calls
- **TURN** - Relays traffic for cross-network calls
- Multiple servers configured for reliability

## Testing Checklist

- [ ] Diagnostics all pass on `/call-test` page
- [ ] Can make calls between different browsers
- [ ] Audio is clear in both directions
- [ ] Call controls (mute/unmute) work
- [ ] Incoming call notifications appear
- [ ] Calls can be declined/ended properly
- [ ] Works across different networks
- [ ] Console shows no critical errors

## Production Deployment

### Environment Variables Required
```env
# Pusher (Real-time signaling)
PUSHER_APP_ID=your_app_id
NEXT_PUBLIC_PUSHER_KEY=your_key
PUSHER_SECRET=your_secret
NEXT_PUBLIC_PUSHER_CLUSTER=your_cluster

# NextAuth
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=https://yourdomain.com

# MongoDB
MONGODB_URI=your_mongodb_connection_string
```

### Deployment Checklist
- [ ] HTTPS enabled
- [ ] Environment variables configured
- [ ] Pusher credentials valid
- [ ] TURN servers accessible from production
- [ ] Microphone permissions work on target domains
- [ ] Firewall allows WebRTC traffic

## Support

If you encounter issues:
1. Check the diagnostics on `/call-test` page
2. Review browser console for errors
3. Test with different browsers/networks
4. Verify all environment variables are set
5. Ensure HTTPS is working in production

The WebRTC implementation includes comprehensive logging - check the browser console for detailed information about connection states and any issues.