// src/app/api/consultations/route.ts
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const childId = searchParams.get('childId')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')

  const where = childId
    ? {
        child_id: childId,
        child: { user_id: session.user.id },
      }
    : { child: { user_id: session.user.id } }

  const [consultations, total] = await Promise.all([
    prisma.consultation.findMany({
      where,
      orderBy: { created_at: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        child: { select: { name: true } },
        details: {
          where: { role: 'USER' },
          take: 1,
          orderBy: { created_at: 'asc' },
        },
      },
    }),
    prisma.consultation.count({ where }),
  ])

  return NextResponse.json({
    data: consultations,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  })
}
