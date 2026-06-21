import { useCallback } from 'react'
import toast from 'react-hot-toast'
import { deleteChat } from '@/lib/api'
import { removeChatMeta } from '@/lib/chatMetaStorage'
import { useAppStore } from '@/lib/store'

/**
 * 상담 기록을 삭제한다. Optimistic update — 즉시 store 에서 제거하고 실패 시 복원.
 * confirm UI 는 호출자(컴포넌트)에서 처리해 모달 디자인을 통일할 수 있게 한다.
 */
export function useDeleteChat() {
    const { consultationId, setConsultationId, setMessages, setChatSessions } = useAppStore()

    const deleteChatById = useCallback(async (chatId: number): Promise<boolean> => {
        const previousSessions = useAppStore.getState().chatSessions
        const target = previousSessions.find((c) => c.id === chatId)
        if (!target) return false

        // Optimistic — 즉시 UI 에서 제거
        setChatSessions(previousSessions.filter((c) => c.id !== chatId))
        removeChatMeta(chatId)

        const wasActiveConsultation = consultationId === chatId
        if (wasActiveConsultation) {
            setConsultationId(null)
            setMessages([])
        }

        try {
            await deleteChat(chatId)
            toast.success('상담 기록이 삭제되었습니다.')
            return true
        } catch (e) {
            console.error('[useDeleteChat] deleteChat failed', { chatId, error: e })
            // 복원 — 다른 작업이 store 를 변경했을 수 있으므로 최신 state 기준으로 target 만 다시 추가
            const latest = useAppStore.getState().chatSessions
            setChatSessions([target, ...latest].sort((a, b) => b.id - a.id))
            if (wasActiveConsultation) {
                setConsultationId(chatId)
            }
            toast.error('삭제에 실패했습니다.')
            return false
        }
    }, [consultationId, setConsultationId, setMessages, setChatSessions])

    return { deleteChatById }
}
