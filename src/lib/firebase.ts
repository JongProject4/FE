// src/lib/firebase.ts
import { initializeApp, getApps } from 'firebase/app'
import { getMessaging, getToken, onMessage } from 'firebase/messaging'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

export const firebaseApp = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApps()[0]

export async function requestNotificationPermission(): Promise<string | null> {
  if (typeof window === 'undefined') return null
  if (!('Notification' in window)) return null

  try {
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') return null

    const messaging = getMessaging(firebaseApp)
    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    })

    // Save token to server
    await fetch('/api/fcm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })

    return token
  } catch (err) {
    console.error('[FCM] Permission error:', err)
    return null
  }
}

export function setupForegroundMessages(onReceive: (payload: any) => void) {
  if (typeof window === 'undefined') return
  try {
    const messaging = getMessaging(firebaseApp)
    return onMessage(messaging, onReceive)
  } catch (err) {
    console.error('[FCM] Foreground message error:', err)
  }
}
