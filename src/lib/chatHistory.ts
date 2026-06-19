import { getChatHistory, type ChatDetailResponse } from '@/lib/api'
import type { Message } from '@/lib/store'

const VOICE_PLACEHOLDER_RE = /^(🎙\s*)?(음성\s*(메시지|상담(\.\.\.)?|인식\s*중(\.\.\.)?)?|voice\s*message)$/i

export function isVoicePlaceholder(text?: string | null): boolean {
  if (!text?.trim()) return true
  return VOICE_PLACEHOLDER_RE.test(text.trim())
}

export function historyToMessages(history: ChatDetailResponse[]): Message[] {
  return history.map((h, idx) => ({
    id: `hist-${idx}`,
    role: h.role === 'USER' ? 'user' : 'assistant',
    content: h.content,
    imageUrl: h.imageUrl,
    timestamp: h.time,
  }))
}

export function getFirstUserQuestion(history: ChatDetailResponse[]): string | null {
  const userMsg = history.find((h) => h.role === 'USER' && h.content?.trim())
  if (!userMsg?.content) return null
  const content = userMsg.content.trim()
  return isVoicePlaceholder(content) ? null : content
}

export function buildChatTitleFromHistory(history: ChatDetailResponse[], maxLen = 30): string {
  const question = getFirstUserQuestion(history)
  if (!question) return ''
  if (question.length <= maxLen) return question
  return `${question.slice(0, maxLen)}...`
}

export function formatVoiceChatTitle(title: string): string {
  const clean = title.replace(/^🎙\s*/, '').trim()
  return clean ? `🎙 ${clean}` : '🎙 음성 상담'
}

export async function fetchChatHistory(chatId: number): Promise<ChatDetailResponse[]> {
  return getChatHistory(chatId)
}
