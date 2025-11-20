# Progressive Web App (PWA) Setup Guide

## 🎯 Overview

Your SRDS application is now configured as a Progressive Web App (PWA) that can be installed on mobile devices as a real app with:
- ✅ **App Installation** - Install on home screen (not just a shortcut)
- ✅ **Push Notifications** - Receive call and message notifications
- ✅ **Offline Support** - Basic functionality when offline
- ✅ **Native App Feel** - Full-screen, no browser UI
- ✅ **Background Sync** - Sync data when connection returns

## 📱 Quick Setup

### Step 1: Install Dependencies

```bash
npm install
```

This installs the `web-push` package needed for push notifications.

### Step 2: Generate App Icons

**Option A: Use the HTML Generator (Easiest)**
1. Open `create-placeholder-icons.html` in your browser
2. Customize the app name and colors
3. Download all generated icons
4. Save them in `public/icons/` folder

**Option B: Use Your Own Logo**
1. Create a 1024x1024 PNG logo named `icon-source.png`
2. Install sharp: `npm install sharp`
3. Run: `node generate-icons.js`
4. Icons will be generated in `public/icons/`

**Option C: Use Online Tools**
- https://www.pwabuilder.com/imageGenerator
- https://realfavicongenerator.net/

Required sizes: 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512

### Step 3: Generate VAPID Keys for Push Notifications

```bash
npx web-push generate-vapid-keys
```

This will output something like:
```
Public Key: BEl62iUYgUivxIkv69yViEuiBIa...
Private Key: 5J8x4fKl3kR9mN2pQ7wV1tY6uH...
```

### Step 4: Update Environment Variables

Add to your `.env` file:

```env
# VAPID Keys for Push Notifications
VAPID_PUBLIC_KEY=your_public_key_here
VAPID_PRIVATE_KEY=your_private_key_here
VAPID_EMAIL=admin@yourdomain.com

# Make public key available to client
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key_here
```

### Step 5: Deploy with HTTPS

PWAs require HTTPS in production. Deploy to:
- **Vercel** (recommended) - Automatic HTTPS
- **Netlify** - Automatic HTTPS
- **Your own server** - Configure SSL certificate

### Step 6: Test Installation

1. **On Android (Chrome/Edge):**
   - Visit your site
   - Look for "Install app" banner
   - Or tap menu → "Install app" / "Add to Home Screen"

2. **On iOS (Safari):**
   - Visit your site
   - Tap Share button (📤)
   - Scroll down and tap "Add to Home Screen"
   - Tap "Add"

## 🔔 Push Notifications

### How It Works

1. **User logs in** → PWA Manager automatically requests notification permission
2. **Permission granted** → Device subscribes to push notifications
3. **Subscription saved** → Stored in user's MongoDB profile
4. **Incoming call/message** → Server sends push notification to all user's devices
5. **User receives notification** → Even when app is closed!

### Testing Push Notifications

```javascript
// In browser console or your code
import { showLocalNotification } from '@/lib/pushNotifications';

// Test notification
await showLocalNotification('Test Call', {
  body: 'This is a test notification',
  requireInteraction: true
});
```

### Sending Push Notifications from Server

```javascript
// Example: Send notification when call starts
await fetch('/api/push/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    to: 'user@example.com',
    title: 'Incoming Call',
    body: 'John Doe is calling you',
    data: {
      type: 'call',
      from: 'john@example.com',
      url: '/inbox'
    }
  })
});
```

## 📂 File Structure

```
public/
├── manifest.json          # PWA manifest
├── sw.js                  # Service worker
├── offline.html           # Offline fallback page
└── icons/                 # App icons
    ├── icon-72x72.png
    ├── icon-96x96.png
    ├── icon-128x128.png
    ├── icon-144x144.png
    ├── icon-152x152.png
    ├── icon-192x192.png
    ├── icon-384x384.png
    └── icon-512x512.png

src/
├── components/
│   ├── PWAManager.jsx           # Service worker registration
│   └── PWAInstallPrompt.jsx     # Install prompt UI
├── lib/
│   └── pushNotifications.js     # Push notification utilities
└── app/
    ├── layout.js                # PWA meta tags
    └── api/
        └── push/
            ├── subscribe/route.js    # Subscribe to notifications
            ├── unsubscribe/route.js  # Unsubscribe
            └── send/route.js         # Send notifications
```

## 🎨 Customization

### Update App Name and Colors

Edit `public/manifest.json`:

```json
{
  "name": "Your App Name",
  "short_name": "App",
  "theme_color": "#your-color",
  "background_color": "#your-color"
}
```

### Customize Install Prompt

Edit `src/components/PWAInstallPrompt.jsx` to change:
- Prompt timing (currently 3 seconds after page load)
- Prompt design and messaging
- Dismiss behavior (currently 7 days)

### Customize Notifications

Edit `src/lib/pushNotifications.js` to change:
- Notification icons
- Vibration patterns
- Sound (requires audio file)
- Action buttons

## 🧪 Testing Checklist

### Installation Testing
- [ ] Install prompt appears on mobile
- [ ] App installs successfully
- [ ] App icon appears on home screen
- [ ] App opens in standalone mode (no browser UI)
- [ ] App name displays correctly

### Notification Testing
- [ ] Permission request appears
- [ ] Notifications work when app is open
- [ ] Notifications work when app is closed
- [ ] Notifications work when device is locked
- [ ] Clicking notification opens correct page
- [ ] Notification sound/vibration works

### Offline Testing
- [ ] App loads when offline
- [ ] Offline page displays correctly
- [ ] App reconnects when back online
- [ ] Cached pages work offline

### Cross-Platform Testing
- [ ] Android Chrome
- [ ] Android Edge
- [ ] iOS Safari
- [ ] Desktop Chrome
- [ ] Desktop Edge

## 🚀 Production Deployment

### Pre-Deployment Checklist

1. **Icons Generated** ✅
   - All 8 icon sizes created
   - Icons look good at all sizes
   - Icons saved in `public/icons/`

2. **VAPID Keys Generated** ✅
   - Keys generated with web-push
   - Keys added to environment variables
   - Public key available to client

3. **HTTPS Enabled** ✅
   - SSL certificate installed
   - All pages served over HTTPS
   - No mixed content warnings

4. **Environment Variables Set** ✅
   ```env
   VAPID_PUBLIC_KEY=...
   VAPID_PRIVATE_KEY=...
   VAPID_EMAIL=...
   NEXT_PUBLIC_VAPID_PUBLIC_KEY=...
   ```

5. **Service Worker Tested** ✅
   - Service worker registers successfully
   - No console errors
   - Caching works correctly

### Deployment Steps

1. **Build the app:**
   ```bash
   npm run build
   ```

2. **Test production build locally:**
   ```bash
   npm start
   ```

3. **Deploy to hosting:**
   ```bash
   # Vercel
   vercel --prod

   # Or Netlify
   netlify deploy --prod

   # Or your own server
   # Upload build files and start with: npm start
   ```

4. **Verify PWA:**
   - Open Chrome DevTools
   - Go to Application tab
   - Check "Manifest" section
   - Check "Service Workers" section
   - Run Lighthouse PWA audit

## 🐛 Troubleshooting

### "Install app" button doesn't appear

**Causes:**
- Not using HTTPS (except localhost)
- Service worker not registered
- Manifest.json has errors
- Already installed

**Solutions:**
- Check browser console for errors
- Verify manifest.json is accessible
- Clear browser cache and try again
- Use Chrome DevTools → Application → Manifest

### Push notifications not working

**Causes:**
- Permission denied
- VAPID keys not configured
- Service worker not active
- Subscription not saved

**Solutions:**
- Check Notification.permission in console
- Verify VAPID keys in .env
- Check service worker status in DevTools
- Check user.pushSubscriptions in database

### App doesn't work offline

**Causes:**
- Service worker not caching correctly
- Network-first strategy for all requests
- API calls failing without fallback

**Solutions:**
- Check service worker cache in DevTools
- Update caching strategy in sw.js
- Add offline fallbacks for API calls

### iOS installation issues

**Causes:**
- Not using Safari browser
- Missing apple-touch-icon
- Manifest not properly configured

**Solutions:**
- Use Safari (not Chrome on iOS)
- Add apple-touch-icon meta tag
- Follow iOS-specific instructions in install prompt

## 📊 Analytics & Monitoring

### Track PWA Installations

```javascript
// In your analytics code
window.addEventListener('appinstalled', () => {
  // Track installation
  gtag('event', 'pwa_install', {
    event_category: 'engagement',
    event_label: 'PWA Installed'
  });
});
```

### Monitor Service Worker

```javascript
// Check service worker status
navigator.serviceWorker.ready.then(registration => {
  console.log('Service Worker Status:', registration.active.state);
});
```

### Track Notification Engagement

```javascript
// In sw.js notificationclick event
self.addEventListener('notificationclick', (event) => {
  // Send analytics event
  fetch('/api/analytics/notification-click', {
    method: 'POST',
    body: JSON.stringify({ tag: event.notification.tag })
  });
});
```

## 🎯 Best Practices

1. **Keep Service Worker Updated**
   - Version your cache names
   - Clean up old caches
   - Test updates thoroughly

2. **Optimize Caching Strategy**
   - Cache static assets aggressively
   - Use network-first for dynamic content
   - Implement background sync for offline actions

3. **Respect User Preferences**
   - Don't spam with notifications
   - Allow easy opt-out
   - Remember user's choices

4. **Test Thoroughly**
   - Test on real devices
   - Test different network conditions
   - Test offline scenarios

5. **Monitor Performance**
   - Track installation rates
   - Monitor notification engagement
   - Measure offline usage

## 🔗 Resources

- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [Workbox (Advanced PWA)](https://developers.google.com/web/tools/workbox)

## ✅ Your PWA is Ready!

Once you complete the setup steps above, your SRDS application will be a fully functional Progressive Web App that users can install on their devices and receive push notifications for calls and messages!

The app will feel like a native mobile app with:
- Fast loading
- Offline support
- Push notifications
- Home screen icon
- Full-screen experience
- Background sync

Deploy it and start testing! 🚀