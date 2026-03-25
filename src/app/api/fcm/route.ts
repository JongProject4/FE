// src/app/api/fcm/route.ts
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// Save FCM token for the user
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { token } = await req.json()
  if (!token) return NextResponse.json({ error: 'Token required' }, { status: 400 })

  await prisma.user.update({
    where: { id: session.user.id },
    data: { fcm_token: token },
  })

  return NextResponse.json({ saved: true })
}

// Send push notification (server-to-server, use Firebase Admin SDK)
export async function sendPushNotification(
  fcmToken: string,
  title: string,
  body: string,
  data?: Record<string, string>
) {
  // Using Firebase Admin SDK
  // Make sure FIREBASE_ADMIN_* env vars are set
  try {
    const res = await fetch(
      `https://fcm.googleapis.com/v1/projects/${process.env.FIREBASE_ADMIN_PROJECT_ID}/messages:send`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${await getFirebaseAccessToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: {
            token: fcmToken,
            notification: { title, body },
            data: data || {},
            webpush: {
              notification: {
                icon: '/icon-192.png',
                badge: '/badge-72.png',
              },
            },
          },
        }),
      }
    )
    return res.ok
  } catch (err) {
    console.error('[FCM] Push error:', err)
    return false
  }
}

async function getFirebaseAccessToken(): Promise<string> {
  // In production, use firebase-admin SDK:
  // import admin from 'firebase-admin'
  // return admin.app().options.credential!.getAccessToken()
  return 'placeholder-token'
}
