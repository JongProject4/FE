// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js')

firebase.initializeApp({
  apiKey: self.FIREBASE_CONFIG?.apiKey,
  authDomain: self.FIREBASE_CONFIG?.authDomain,
  projectId: self.FIREBASE_CONFIG?.projectId,
  messagingSenderId: self.FIREBASE_CONFIG?.messagingSenderId,
  appId: self.FIREBASE_CONFIG?.appId,
})

const messaging = firebase.messaging()

messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification ?? {}
  self.registration.showNotification(title || '소아과 AI', {
    body: body || '새로운 알림이 있습니다.',
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    data: payload.data,
    actions: [
      { action: 'open', title: '확인하기' },
      { action: 'dismiss', title: '닫기' },
    ],
  })
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  if (event.action === 'open' || !event.action) {
    event.waitUntil(clients.openWindow('/chat'))
  }
})
