'use client'
// src/app/chat/page.tsx
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { getAccessToken } from '@/lib/api'
import { ChatHeader } from '@/components/chat/ChatHeader'
import { MessageList } from '@/components/chat/MessageList'
import { ChatInput } from '@/components/chat/ChatInput'
import { WelcomeScreen } from '@/components/chat/WelcomeScreen'
import { QuickChips } from '@/components/chat/QuickChips'
import { BottomNav } from '@/components/layout/BottomNav'
import toast from 'react-hot-toast'

export default function ChatPage() {
  const router = useRouter()
  const {
    messages, consultationId,
    isLoading, addMessage, updateLastMessage, setConsultationId,
    setLoading,
  } = useAppStore()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [uploadedImg, setUploadedImg] = useState<string | null>(null)
  const [checking, setChecking] = useState(true)

  // Auth guard - JWT 토큰 체크
  useEffect(() => {
    const token = getAccessToken()
    if (!token) {
      router.replace('/login')
    } else {
      setChecking(false)
    }
  }, [router])

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Load history if consultationId exists
  useEffect(() => {
    if (consultationId && messages.length === 0) {
      const loadHistory = async () => {
        try {
          const { getChatHistory } = await import('@/lib/api')
          const history = await getChatHistory(Number(consultationId))
          const { setMessages } = useAppStore.getState()

          const formatted = history.map((h, idx) => ({
            id: `hist-${idx}`,
            role: (h.role.toLowerCase() === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
            content: h.content,
            timestamp: h.time
          }))
          setMessages(formatted)
        } catch (err) {
          console.error('Failed to load history', err)
        }
      }
      loadHistory()
    }
  }, [consultationId])

  const sendMessage = useCallback(async (text: string) => {
    if (isLoading) return
    if (!text.trim() && !uploadedImg) return

    // 1. Get or create consultationId (Room)
    let currentRoomId = consultationId
    if (!currentRoomId) {
      try {
        const { getChildren, createChat } = await import('@/lib/api')
        const children = await getChildren()
        if (children.length === 0) {
          toast.error('먼저 아이를 등록해주세요.')
          router.push('/child-setup')
          return
        }
        const newRoom = await createChat({
          childId: children[0].id,
          title: text.slice(0, 20) || '새 상담'
        })
        currentRoomId = String(newRoom.chatId)
        setConsultationId(currentRoomId)
      } catch (err) {
        toast.error('상담방 생성에 실패했습니다.')
        return
      }
    }

    const userMsg = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: text,
      imageUrl: uploadedImg || undefined,
      timestamp: new Date().toISOString(),
    }
    addMessage(userMsg)
    setUploadedImg(null)
    setLoading(true)

    const aiMsgId = (Date.now() + 1).toString()
    addMessage({
      id: aiMsgId,
      role: 'assistant',
      content: '생각 중...',
      timestamp: new Date().toISOString(),
      isStreaming: true,
    })

    try {
      const { sendChatMessage } = await import('@/lib/api')
      const responseText = await sendChatMessage(Number(currentRoomId), text)

      updateLastMessage(responseText, true)
    } catch (err) {
      updateLastMessage('죄송합니다. 오류가 발생했습니다. 다시 시도해주세요.', true)
      toast.error('연결 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }, [isLoading, messages, consultationId, uploadedImg, router, addMessage, setConsultationId, setLoading, updateLastMessage])

  if (checking) {
    return (
      <div className="flex h-dvh items-center justify-center bg-[#F4FCFB]">
        <div className="w-10 h-10 rounded-full border-[3px] border-[#52B788] border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <main className="flex flex-col h-dvh max-w-[430px] mx-auto bg-[#F4FCFB] overflow-hidden">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto" id="messages-container">
        {messages.length === 0 ? (
          <WelcomeScreen
            onSampleClick={sendMessage}
          />
        ) : (
          <MessageList messages={messages} />
        )}
        <div ref={messagesEndRef} />
      </div>

      {messages.length > 0 && (
        <QuickChips onChipClick={sendMessage} />
      )}

      <ChatInput
        onSend={sendMessage}
        onImageUpload={setUploadedImg}
        uploadedImg={uploadedImg}
        disabled={isLoading}
      />

      <div className="text-center text-[10px] text-[#94A3B8] py-1 bg-white">
        AI 상담은 의사 진료를 대체하지 않습니다
      </div>
      <BottomNav />
    </main>
  )
}
