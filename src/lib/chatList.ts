import { getChildren, getChatRooms, getChatHistory } from '@/lib/api'
import { getChatMeta } from '@/lib/chatMetaStorage'
import type { ChatSession } from '@/lib/store'

function truncate(text: string, maxLength: number): string {
    const normalized = text.trim()
    if (normalized.length <= maxLength) return normalized
    return `${normalized.slice(0, maxLength)}...`
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

export async function fetchChatSessions(titleMaxLength = 30): Promise<ChatSession[]> {
    const children = await getChildren()
    if (children.length === 0) return []

    const sessions: ChatSession[] = []

    for (const child of children) {
        const rooms = await getChatRooms(child.id)
        if (!Array.isArray(rooms)) continue

        const sortedIds = [...parseRoomIds(rooms)].sort((a, b) => b - a)

        for (const id of sortedIds) {
            const stored = getChatMeta(id)
            let title = stored?.title ?? `${child.name}의 상담 #${id}`
            let date = stored?.date ?? new Date().toLocaleDateString('ko-KR')

            try {
                const messages = await getChatHistory(id)
                const firstUserMsg = messages.find((m) => m.role === 'USER')
                if (!stored?.title && firstUserMsg?.content?.trim()) {
                    title = truncate(firstUserMsg.content, titleMaxLength)
                }
                if (firstUserMsg?.time) {
                    date = formatDate(firstUserMsg.time)
                }
            } catch (e) {
                console.error(`Failed to load chat ${id}`, e)
            }

            sessions.push({
                id,
                title,
                date,
                childName: child.name,
                category: stored?.category ?? 'ANALYZING',
                riskLevel: stored?.riskLevel ?? 'ANALYZING',
            })
        }
    }

    return sessions.sort((a, b) => b.id - a.id)
}
