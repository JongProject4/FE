import { fetchChatSessions } from '@/lib/chatList'
import type { CalendarEvent, ConsultationRecord, DayEvents } from '@/components/calendar/types'

/** persist된 상담 이벤트 제거 (새로고침 시 중복 누적 방지) */
export function stripConsultationEvents(events: DayEvents): DayEvents {
    const result: DayEvents = {}
    for (const [key, list] of Object.entries(events)) {
        const filtered = list.filter((e) => e.type !== 'consultation')
        if (filtered.length > 0) result[key] = filtered
    }
    return result
}

export function mergeConsultationEvents(prev: DayEvents, consultationEvents: DayEvents): DayEvents {
    const merged = stripConsultationEvents(prev)
    for (const [key, list] of Object.entries(consultationEvents)) {
        merged[key] = [...(merged[key] || []), ...list]
    }
    return merged
}

export async function fetchConsultationCalendarEvents(): Promise<DayEvents> {
    const sessions = await fetchChatSessions(40)
    const events: DayEvents = {}

    for (const session of sessions) {
        const key = session.eventDateKey
        if (!key) continue

        const event: ConsultationRecord = {
            id: `chat-${session.id}`,
            type: 'consultation',
            childId: session.childId,
            childName: session.childName,
            title: session.title,
            category: session.category,
            riskLevel: session.riskLevel,
            chatId: session.id,
            date: key,
            createdAt: session.date,
        }

        if (!events[key]) events[key] = []
        events[key].push(event)
    }

    return events
}
