import { useCallback } from 'react'
import toast from 'react-hot-toast'
import { deleteChat } from '@/lib/api'
import { removeChatMeta } from '@/lib/chatMetaStorage'
import { useAppStore } from '@/lib/store'

export function useDeleteChat() {
    const { consultationId, setConsultationId, setMessages, setChatSessions } = useAppStore()

    const deleteChatById = useCallback(async (chatId: number) => {
        if (!window.confirm('이 상담 기록을 삭제할까요?')) return

        try {
            await deleteChat(chatId)
            removeChatMeta(chatId)

            const currentSessions = useAppStore.getState().chatSessions
            setChatSessions(currentSessions.filter((c) => c.id !== chatId))

            if (consultationId === String(chatId)) {
                setConsultationId(null)
                setMessages([])
            }

            toast.success('상담 기록이 삭제되었습니다.')
        } catch {
            toast.error('삭제에 실패했습니다.')
        }
    }, [consultationId, setConsultationId, setMessages, setChatSessions])

    return { deleteChatById }
}
