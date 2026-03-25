// src/lib/ai.ts
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export interface ChildContext {
  name: string
  age: string
  gender: string
  weight?: string
  allergies?: string
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

function buildSystemPrompt(child: ChildContext): string {
  const allergyInfo = child.allergies
    ? `알레르기: ${child.allergies}`
    : '알레르기 정보 없음'

  return `당신은 경험 많은 소아과 전문의 AI 어시스턴트입니다. 
부모들이 자녀의 건강 문제를 이해하고 적절히 대응할 수 있도록 따뜻하고 전문적인 안내를 제공합니다.

**현재 상담 아동 정보:**
- 이름: ${child.name}
- 나이: ${child.age}
- 성별: ${child.gender}
- 체중: ${child.weight || '미입력'}
- ${allergyInfo}

**응답 규칙:**
1. 한국어로 응답하세요 (부모님 언어)
2. 따뜻하고 공감적인 tone 유지
3. 의학 전문 용어는 쉽게 설명
4. 응급 상황(호흡 곤란, 고열 경련, 의식 저하 등)은 즉시 응급실 방문 권고
5. 답변 구조:
   - 증상 이해: 간단한 설명
   - 즉각 조치: 집에서 할 수 있는 것
   - 병원 방문 기준: 언제 가야 하는지
   - 위험도: [낮음/중간/높음]
6. 알레르기 정보가 있으면 답변에 반영
7. 아이 이름을 활용해 개인적인 느낌을 주세요
8. 진단은 내리지 않고, 가이드 제공에 집중

**절대 금지:**
- 구체적 의약품 용량 처방
- 확진 진단
- 부모를 불필요하게 불안하게 만드는 표현

응답은 200-400자 내외로 간결하게 작성하세요.`
}

export async function streamChat(
  messages: ChatMessage[],
  child: ChildContext,
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: (err: Error) => void
) {
  try {
    const stream = client.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: buildSystemPrompt(child),
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    })

    for await (const chunk of stream) {
      if (
        chunk.type === 'content_block_delta' &&
        chunk.delta.type === 'text_delta'
      ) {
        onChunk(chunk.delta.text)
      }
    }
    onDone()
  } catch (err) {
    onError(err as Error)
  }
}

export async function analyzeRisk(text: string): Promise<'LOW' | 'MEDIUM' | 'HIGH'> {
  const highRiskKeywords = ['응급', '경련', '호흡곤란', '의식', '청색증', '심한 탈수', '즉시 병원']
  const mediumRiskKeywords = ['열이 높', '3일 이상', '악화', '먹지 못', '병원 방문']

  if (highRiskKeywords.some((k) => text.includes(k))) return 'HIGH'
  if (mediumRiskKeywords.some((k) => text.includes(k))) return 'MEDIUM'
  return 'LOW'
}

export function categorizeSymptom(text: string): string {
  if (/열|발열|체온/.test(text)) return 'FEVER'
  if (/기침|가래|콧물|감기/.test(text)) return 'RESPIRATORY'
  if (/발진|두드러기|피부|가려움/.test(text)) return 'SKIN'
  if (/구토|설사|복통|배/.test(text)) return 'DIGESTIVE'
  if (/밥|식욕|영양|성장/.test(text)) return 'NUTRITION'
  return 'GENERAL'
}
