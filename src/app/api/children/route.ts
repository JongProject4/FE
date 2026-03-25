// src/app/api/children/route.ts
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/children — list user's children
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (session.user.id === 'guest_user_id') {
    return NextResponse.json([{
      id: 'dummy_child',
      name: '우리 아이(샘플)',
      birthdate: '2022-01-01',
      gender: 'MALE',
      weight: 12.5,
      allergies: '없음',
    }])
  }

  try {
    const children = await prisma.child.findMany({
      where: { user_id: session.user.id },
      orderBy: { created_at: 'asc' },
    })
    return NextResponse.json(children)
  } catch (err) {
    console.error('[API] children fetch error:', err)
    return NextResponse.json([{
      id: 'dummy_child',
      name: '우리 아이(샘플)',
      birthdate: '2022-01-01',
      gender: 'MALE',
      weight: 12.5,
      allergies: '없음',
    }])
  }
}

// POST /api/children — create child
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, birthdate, gender, weight, allergies } = await req.json()

  if (!name || !birthdate || !gender) {
    return NextResponse.json({ error: '이름, 생년월일, 성별은 필수입니다.' }, { status: 400 })
  }

  const child = await prisma.child.create({
    data: {
      user_id: session.user.id,
      name,
      birthdate: new Date(birthdate),
      gender,
      weight: weight ? parseFloat(weight) : null,
      allergies: allergies || null,
    },
  })

  return NextResponse.json(child, { status: 201 })
}
