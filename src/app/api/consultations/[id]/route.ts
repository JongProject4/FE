// src/app/api/consultations/[id]/route.ts
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const consultation = await prisma.consultation.findFirst({
    where: {
      id: params.id,
      child: { user_id: session.user.id },
    },
    include: {
      child: true,
      details: { orderBy: { created_at: 'asc' } },
    },
  })

  if (!consultation) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(consultation)
}
