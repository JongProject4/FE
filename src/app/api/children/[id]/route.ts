// src/app/api/children/[id]/route.ts
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const child = await prisma.child.findFirst({
    where: { id: params.id, user_id: session.user.id },
    include: {
      consultations: {
        orderBy: { created_at: 'desc' },
        take: 10,
        include: { details: { take: 1, orderBy: { created_at: 'asc' } } },
      },
    },
  })

  if (!child) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(child)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const child = await prisma.child.updateMany({
    where: { id: params.id, user_id: session.user.id },
    data: {
      name: body.name,
      birthdate: body.birthdate ? new Date(body.birthdate) : undefined,
      gender: body.gender,
      weight: body.weight ? parseFloat(body.weight) : null,
      allergies: body.allergies || null,
    },
  })

  return NextResponse.json({ updated: child.count })
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await prisma.child.deleteMany({ where: { id: params.id, user_id: session.user.id } })
  return NextResponse.json({ deleted: true })
}
