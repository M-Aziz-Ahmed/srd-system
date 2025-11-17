import Pusher from 'pusher-js';

let pusher = null;
let channel = null;

export const initializePusher = () => {
  if (typeof window === 'undefined') return null;
  
  if (pusher) {
    return pusher;
  }
  
  pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY || 'test-key', {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'us2',
    forceTLS: true,
    enabledTransports: ['ws', 'wss'],
    authEndpoint: '/api/pusher/auth',
    auth: {
      headers: {
        'X-CSRF-Token': 'test-csrf-token'
      }
    }
  });

  pusher.connection.bind('state_change', (states) => {
  });
  
  return pusher;
};

export const getPusherChannel = () => {
  if (!pusher) {
    initializePusher();
  }
  
  if (!channel) {
    channel = pusher.subscribe('srd-events');
  }
  
  return channel;
};

export const bindPusherEvents = (eventHandlers) => {
  const channel = getPusherChannel();
  
  Object.entries(eventHandlers).forEach(([event, handler]) => {
    channel.bind(event, handler);
  });
  
  return () => {
    Object.entries(eventHandlers).forEach(([event, handler]) => {
      channel.unbind(event, handler);
    });
  };
};

export const disconnectPusher = () => {
  if (pusher) {
    pusher.disconnect();
    pusher = null;
    channel = null;
  }
};