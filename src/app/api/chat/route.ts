// src/app/api/chat/route.ts
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { analyzeRisk, categorizeSymptom } from '@/lib/ai'
import Anthropic from '@anthropic-ai/sdk'
import { NextRequest } from 'next/server'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

function buildSystemPrompt(child: any): string {
  const age = calcAge(child.birthdate)
  const allergyInfo = child.allergies ? `알레르기: ${child.allergies}` : '알레르기 없음'
  return `당신은 경험 많은 소아과 전문의 AI 어시스턴트입니다.
부모들이 자녀의 건강 문제를 이해하고 적절히 대응하도록 돕습니다.

상담 아동: ${child.name} (${age}, ${child.gender === 'FEMALE' ? '여아' : '남아'}, 체중: ${child.weight ? child.weight + 'kg' : '미입력'}, ${allergyInfo})

응답 규칙:
1. 한국어로 따뜻하게 응답
2. 응급 상황은 즉시 응급실 권고
3. 구조: 증상이해 → 즉각조치 → 병원방문기준 → 위험도[낮음/중간/높음]
4. 진단 금지, 가이드 제공
5. 200-400자 간결하게`
}

function calcAge(birthdate: Date): string {
  const now = new Date()
  const birth = new Date(birthdate)
  let years = now.getFullYear() - birth.getFullYear()
  let months = now.getMonth() - birth.getMonth()
  if (months < 0) { years--; months += 12 }
  if (years === 0) return `${months}개월`
  return months > 0 ? `${years}세 ${months}개월` : `${years}세`
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { childId, consultationId, messages, imageUrl } = await req.json()

  const isGuest = session.user.id === 'guest_user_id'
  let child: any

  if (isGuest) {
    child = {
      id: 'dummy_child',
      name: '우리 아이(샘플)',
      birthdate: new Date('2022-01-01'),
      gender: 'MALE',
      weight: 12.5,
      allergies: '없음',
    }
  } else {
    try {
      // Verify child belongs to user
      child = await prisma.child.findFirst({
        where: { id: childId, user_id: session.user.id },
      })
    } catch (err) {
      console.error('[API] chat child verification error:', err)
      // Fallback for dev if DB is broken
      child = {
        id: 'dummy_child',
        name: '우리 아이(샘플)',
        birthdate: new Date('2022-01-01'),
        gender: 'MALE',
        weight: 12.5,
        allergies: '없음',
      }
    }
  }

  if (!child) return new Response('Child not found', { status: 404 })

  // Get or create consultation
  let consultation: any
  if (!isGuest) {
    try {
      if (consultationId) {
        consultation = await prisma.consultation.findUnique({ where: { id: consultationId } })
      } else {
        const lastMsg = messages[messages.length - 1]?.content || ''
        consultation = await prisma.consultation.create({
          data: {
            child_id: childId,
            category: categorizeSymptom(lastMsg),
            risk_level: 'LOW',
          },
        })
      }

      // Save user message
      const lastUserMsg = messages[messages.length - 1]
      await prisma.consultationDetail.create({
        data: {
          consultation_id: consultation!.id,
          role: 'USER',
          content: lastUserMsg.content,
          image_url: imageUrl || null,
        },
      })
    } catch (err) {
      console.error('[API] chat DB ops error:', err)
      consultation = { id: 'temp_cons_id' }
    }
  } else {
    consultation = { id: 'guest_cons_id' }
  }

  // Stream AI response
  const encoder = new TextEncoder()
  let fullText = ''

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const aiStream = anthropic.messages.stream({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1024,
          system: buildSystemPrompt(child),
          messages: messages.map((m: any) => ({
            role: m.role,
            content: m.content,
          })),
        })

        for await (const chunk of aiStream) {
          if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
            fullText += chunk.delta.text
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`)
            )
          }
        }

        // Save AI response & update risk level
        const riskLevel = await analyzeRisk(fullText)
        if (!isGuest) {
          try {
            await prisma.consultationDetail.create({
              data: {
                consultation_id: consultation!.id,
                role: 'AI',
                content: fullText,
              },
            })
            await prisma.consultation.update({
              where: { id: consultation!.id },
              data: { risk_level: riskLevel },
            })
          } catch (err) {
            console.error('[API] chat AI DB save error:', err)
          }
        }

        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ done: true, consultationId: consultation!.id, riskLevel })}\n\n`
          )
        )
        controller.close()
      } catch (err) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: 'AI 오류가 발생했습니다.' })}\n\n`)
        )
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
