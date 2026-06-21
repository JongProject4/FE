import { getChildren, getChatRooms, getChatHistory } from '@/lib/api'
import { getChatMeta } from '@/lib/chatMetaStorage'
import { buildChatTitleFromHistory, isVoicePlaceholder } from '@/lib/chatHistory'
import type { ChatSession } from '@/lib/store'

function toEventDateKey(time?: string): string | null {
    if (!time) return null
    const date = new Date(time)
    if (Number.isNaN(date.getTime())) return null
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
}

function formatDate(time?: string): string {
    if (!time) return new Date().toLocaleDateString('ko-KR')
    const date = new Date(time)
    if (Number.isNaN(date.getTime())) return new Date().toLocaleDateString('ko-KR')
    return date.toLocaleDateString('ko-KR')
}

function parseRoomIds(rooms: unknown[]): number[] {
    return rooms
        .map((item) => (typeof item === 'object' && item !== null ? (item as { chatId?: number; id?: number }).chatId ?? (item as { id?: number }).id : item))
        .map(Number)
        .filter((id) => !Number.isNaN(id))
}

/**
 * 사용자별 모든 아이의 상담 세션을 로드한다.
 * N(아이) * M(상담) 만큼의 API 호출이 발생하므로 Promise.all 로 병렬화한다.
 * 동기 for-loop 으로 처리하면 시연 규모에서도 수 초 이상 걸리는 사례 발생.
 */
export async function fetchChatSessions(titleMaxLength = 30): Promise<ChatSession[]> {
    const children = await getChildren()
    if (children.length === 0) return []

    const perChild = await Promise.all(
        children.map(async (child) => {
            const rooms = await getChatRooms(child.id)
            if (!Array.isArray(rooms)) return [] as ChatSession[]
            const sortedIds = [...parseRoomIds(rooms)].sort((a, b) => b - a)

            return Promise.all(
                sortedIds.map(async (id): Promise<ChatSession> => {
                    const stored = getChatMeta(id)
                    let title = stored?.title ?? `${child.name}의 상담 #${id}`
                    let date = stored?.date ?? new Date().toLocaleDateString('ko-KR')
                    let eventDateKey: string | undefined
                    const isVoice = stored?.isVoice ?? isVoicePlaceholder(stored?.title) ?? false

                    try {
                        const messages = await getChatHistory(id)
                        const apiTitle = buildChatTitleFromHistory(messages, titleMaxLength)
                        if (apiTitle) {
                            title = apiTitle
                        } else if (isVoicePlaceholder(stored?.title)) {
                            title = `${child.name}의 상담 #${id}`
                        }

                        const firstUserMsg = messages.find((m) => m.role === 'USER')
                        if (firstUserMsg?.time) {
                            date = formatDate(firstUserMsg.time)
                            eventDateKey = toEventDateKey(firstUserMsg.time) ?? undefined
                        }
                    } catch (e) {
                        console.error(`Failed to load chat ${id}`, e)
                    }

                    if (!eventDateKey) {
                        eventDateKey = toEventDateKey(stored?.date) ?? toEventDateKey(new Date().toISOString()) ?? undefined
                    }

                    return {
                        id,
                        title,
                        date,
                        childId: String(child.id),
                        childName: child.name,
                        category: stored?.category ?? 'ANALYZING',
                        riskLevel: stored?.riskLevel ?? 'ANALYZING',
                        eventDateKey,
                        isVoice,
                    }
                })
            )
        })
    )

    return perChild.flat().sort((a, b) => b.id - a.id)
}
