// src/app/api/health-logs/route.ts
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const childId = searchParams.get('childId')

  const logs = await prisma.healthLog.findMany({
    where: {
      child_id: childId || undefined,
      child: { user_id: session.user.id },
    },
    orderBy: { event_date: 'desc' },
    take: 50,
  })

  return NextResponse.json(logs)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { childId, log_type, content, value, unit, event_date } = await req.json()

  const child = await prisma.child.findFirst({
    where: { id: childId, user_id: session.user.id },
  })
  if (!child) return NextResponse.json({ error: 'Child not found' }, { status: 404 })

  const log = await prisma.healthLog.create({
    data: {
      child_id: childId,
      log_type,
      content,
      value: value ? parseFloat(value) : null,
      unit: unit || null,
      event_date: event_date ? new Date(event_date) : new Date(),
    },
  })

  return NextResponse.json(log, { status: 201 })
}
