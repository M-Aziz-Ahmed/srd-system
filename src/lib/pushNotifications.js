// Push Notification Manager for SRDS PWA

/**
 * Request notification permission from user
 */
export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

/**
 * Subscribe to push notifications
 */
export async function subscribeToPushNotifications() {
  try {
    // Check if service worker is supported
    if (!('serviceWorker' in navigator)) {
      throw new Error('Service workers are not supported');
    }

    // Check if push notifications are supported
    if (!('PushManager' in window)) {
      throw new Error('Push notifications are not supported');
    }

    // Request permission
    const permissionGranted = await requestNotificationPermission();
    if (!permissionGranted) {
      throw new Error('Notification permission denied');
    }

    // Get service worker registration
    const registration = await navigator.serviceWorker.ready;

    // Check if already subscribed
    let subscription = await registration.pushManager.getSubscription();
    
    if (!subscription) {
      // Subscribe to push notifications
      // Note: You'll need to generate VAPID keys for production
      // Use: npx web-push generate-vapid-keys
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 
        'BEl62iUYgUivxIkv69yViEuiBIa-Ib37J8xQmrpcPBblQV4qvOpGq4aTplZJjfq0HVgkNVOlK5H5o7CRstBWb_A';
      
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      });
    }

    // Send subscription to server
    await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscription)
    });

    console.log('Push notification subscription successful');
    return subscription;

  } catch (error) {
    console.error('Failed to subscribe to push notifications:', error);
    throw error;
  }
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPushNotifications() {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      await subscription.unsubscribe();
      
      // Notify server
      await fetch('/api/push/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ endpoint: subscription.endpoint })
      });
      
      console.log('Unsubscribed from push notifications');
    }
  } catch (error) {
    console.error('Failed to unsubscribe from push notifications:', error);
    throw error;
  }
}

/**
 * Show a local notification (doesn't require server)
 */
export async function showLocalNotification(title, options = {}) {
  try {
    const permissionGranted = await requestNotificationPermission();
    if (!permissionGranted) {
      throw new Error('Notification permission denied');
    }

    const registration = await navigator.serviceWorker.ready;
    
    await registration.showNotification(title, {
      body: options.body || '',
      icon: options.icon || '/icons/icon-192x192.png',
      badge: options.badge || '/icons/icon-72x72.png',
      vibrate: options.vibrate || [200, 100, 200],
      tag: options.tag || 'srds-notification',
      requireInteraction: options.requireInteraction || false,
      data: options.data || {},
      actions: options.actions || []
    });

    console.log('Local notification shown');
  } catch (error) {
    console.error('Failed to show local notification:', error);
    throw error;
  }
}

/**
 * Check if notifications are supported and enabled
 */
export function areNotificationsSupported() {
  return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
}

/**
 * Get current notification permission status
 */
export function getNotificationPermission() {
  if (!('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

/**
 * Helper function to convert VAPID key
 */
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Send push notification for incoming call
 */
export async function notifyIncomingCall(callerName, callerEmail) {
  await showLocalNotification('Incoming Call', {
    body: `${callerName} is calling you`,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [300, 100, 300, 100, 300],
    tag: 'incoming-call',
    requireInteraction: true,
    data: {
      type: 'call',
      from: callerEmail,
      url: '/inbox'
    },
    actions: [
      { action: 'answer', title: 'Answer' },
      { action: 'decline', title: 'Decline' }
    ]
  });
}

/**
 * Send push notification for new message
 */
export async function notifyNewMessage(senderName, messagePreview) {
  await showLocalNotification('New Message', {
    body: `${senderName}: ${messagePreview}`,
    icon: '/icons/icon-192x192.png',
    tag: 'new-message',
    data: {
      type: 'message',
      url: '/inbox'
    }
  });
}