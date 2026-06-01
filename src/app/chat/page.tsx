'use client'
// src/app/chat/page.tsx
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { getAccessToken, getChildren, ChildResponse } from '@/lib/api'
import { ChatHeader } from '@/components/chat/ChatHeader'
import { MessageList } from '@/components/chat/MessageList'
import { ChatInput } from '@/components/chat/ChatInput'
import { WelcomeScreen } from '@/components/chat/WelcomeScreen'
import { QuickChips } from '@/components/chat/QuickChips'
import { ChildSelectModal } from '@/components/chat/ChildSelectModal'
import { BottomNav } from '@/components/layout/BottomNav'
import toast from 'react-hot-toast'

export default function ChatPage() {
  const router = useRouter()
  const {
    messages, consultationId,
    isLoading, addMessage, updateLastMessage, setConsultationId,
    setLoading, addChatSession,
  } = useAppStore()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [uploadedImg, setUploadedImg] = useState<string | null>(null)
  const [checking, setChecking] = useState(true)

  // Audio Context for streaming
  const audioCtxRef = useRef<AudioContext | null>(null)
  const nextAudioTimeRef = useRef<number>(0)

  const playAudioChunk = useCallback(async (base64: string) => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    const ctx = audioCtxRef.current
    try {
      const binary = atob(base64)
      const bytes = new Uint8Array(binary.length)
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)

      const buffer = await ctx.decodeAudioData(bytes.buffer)
      const source = ctx.createBufferSource()
      source.buffer = buffer
      source.connect(ctx.destination)

      if (nextAudioTimeRef.current < ctx.currentTime) {
        nextAudioTimeRef.current = ctx.currentTime
      }
      source.start(nextAudioTimeRef.current)
      nextAudioTimeRef.current += buffer.duration
    } catch (e) {
      console.warn('Audio chunk decode failed', e)
    }
  }, [])

  // Current active child for this chat session
  const [activeChild, setActiveChild] = useState<ChildResponse | null>(null)
  const [allChildren, setAllChildren] = useState<ChildResponse[]>([])

  // Child selector modal — shown when starting a new chat with multiple children
  const [showChildModal, setShowChildModal] = useState(false)
  // Pending message waiting for child selection
  const pendingMsgRef = useRef<string | null>(null)

  // Auth guard
  useEffect(() => {
    const token = getAccessToken()
    if (!token) {
      router.replace('/login')
    } else {
      setChecking(false)
    }
  }, [router])

  // Load children list on mount
  useEffect(() => {
    getChildren()
      .then(setAllChildren)
      .catch(console.error)
  }, [])

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Load history if consultationId exists (opening old chat)
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

  // Core send logic — after child is already chosen
  const doSendMessage = useCallback(async (text: string, chosenChild: ChildResponse) => {
    if (isLoading) return

    let currentRoomId = consultationId
    if (!currentRoomId) {
      try {
        const { createChat } = await import('@/lib/api')
        const newRoom = await createChat({ childId: chosenChild.id })
        currentRoomId = String(newRoom.chatId)
        setConsultationId(currentRoomId)
        addChatSession({
          id: newRoom.chatId,
          title: text.length > 25 ? text.substring(0, 25) + '...' : text,
          date: new Date().toLocaleDateString('ko-KR'),
          childName: chosenChild.name,
        })
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

    addMessage({
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '생각 중...',
      timestamp: new Date().toISOString(),
      isStreaming: true,
    })

    try {
      const { sendChatMessage } = await import('@/lib/api')
      const responseText = await sendChatMessage(Number(currentRoomId), text, uploadedImg || undefined)

      const chars = responseText.split('')
      let displayed = ''
      for (let i = 0; i < chars.length; i++) {
        displayed += chars[i]
        updateLastMessage(displayed, false)
        if (i % 3 === 0) await new Promise(r => setTimeout(r, 30))
      }
      updateLastMessage(responseText, true)
    } catch (err: any) {
      console.error('[Chat Error]', err)
      updateLastMessage('죄송합니다. 오류가 발생했습니다. 다시 시도해주세요.', true)
      toast.error(`연결 오류: ${err.message || '알 수 없는 오류'}`)
    } finally {
      setLoading(false)
    }
  }, [isLoading, consultationId, uploadedImg, addMessage, setConsultationId, setLoading, updateLastMessage, addChatSession, setUploadedImg])

  // Core voice send logic
  const doSendVoiceMessage = useCallback(async (blob: Blob, chosenChild: ChildResponse) => {
    if (isLoading) return

    let currentRoomId = consultationId
    if (!currentRoomId) {
      try {
        const { createChat } = await import('@/lib/api')
        const newRoom = await createChat({ childId: chosenChild.id })
        currentRoomId = String(newRoom.chatId)
        setConsultationId(currentRoomId)
        addChatSession({
          id: newRoom.chatId,
          title: '음성 상담...',
          date: new Date().toLocaleDateString('ko-KR'),
          childName: chosenChild.name,
        })
      } catch (err) {
        toast.error('상담방 생성에 실패했습니다.')
        return
      }
    }

    setLoading(true)
    const userMsgId = Date.now().toString()
    // Add placeholder user message (will be updated with transcript)
    addMessage({
      id: userMsgId,
      role: 'user',
      content: '음성 인식 중...',
      timestamp: new Date().toISOString(),
    })

    addMessage({
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '답변 작성 중...',
      timestamp: new Date().toISOString(),
      isStreaming: true,
    })

    // Reset audio context clock for new response
    nextAudioTimeRef.current = 0

    try {
      let isFirstChunk = true
      let fullAssistantText = ''

      const { sendVoiceMessageStream } = await import('@/lib/api')
      await sendVoiceMessageStream(Number(currentRoomId), blob, (chunk) => {
        if (chunk.transcript && isFirstChunk) {
          // Update user message with transcript
          useAppStore.setState(s => {
            const msgs = [...s.messages]
            const uIdx = msgs.findIndex(m => m.id === userMsgId)
            if (uIdx !== -1) msgs[uIdx] = { ...msgs[uIdx], content: chunk.transcript! }
            return { messages: msgs }
          })
          isFirstChunk = false
        }
        if (chunk.text) {
          fullAssistantText += chunk.text
          updateLastMessage(fullAssistantText, false)
        }
        if (chunk.audio) {
          playAudioChunk(chunk.audio)
        }
        if (chunk.isFinal) {
          updateLastMessage(fullAssistantText, true)
        }
      })
    } catch (err: any) {
      console.error('[Voice Chat Error]', err)
      updateLastMessage('죄송합니다. 음성 처리 중 오류가 발생했습니다.', true)
      toast.error(`연결 오류: ${err.message || '알 수 없는 오류'}`)
    } finally {
      setLoading(false)
    }
  }, [isLoading, consultationId, addMessage, setConsultationId, setLoading, updateLastMessage, addChatSession, playAudioChunk])

  // Entry point for send — handle child selection if needed
  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() && !uploadedImg) return

    if (consultationId) {
      const child = activeChild || allChildren[0]
      if (child) setActiveChild(child)
      doSendMessage(text, child || activeChild)
      return
    }

    if (allChildren.length === 0) {
      toast.error('먼저 아이를 등록해주세요.')
      router.push('/child-setup')
      return
    }

    if (allChildren.length === 1) {
      setActiveChild(allChildren[0])
      doSendMessage(text, allChildren[0])
    } else {
      pendingMsgRef.current = text
      setShowChildModal(true)
    }
  }, [consultationId, uploadedImg, allChildren, activeChild, doSendMessage, router])

  const sendVoiceMessage = useCallback(async (blob: Blob) => {
    if (consultationId) {
      const child = activeChild || allChildren[0]
      if (child) setActiveChild(child)
      doSendVoiceMessage(blob, child || activeChild)
      return
    }

    if (allChildren.length === 0) {
      toast.error('먼저 아이를 등록해주세요.')
      router.push('/child-setup')
      return
    }

    if (allChildren.length === 1) {
      setActiveChild(allChildren[0])
      doSendVoiceMessage(blob, allChildren[0])
    } else {
      // If multiple children, we'd need a way to pass blob. Hack: save to state/ref.
      // For now, auto-select first child or prompt. To fully support:
      toast('새 음성 채팅은 첫 번째 아이로 진행됩니다.')
      setActiveChild(allChildren[0])
      doSendVoiceMessage(blob, allChildren[0])
    }
  }, [consultationId, allChildren, activeChild, doSendVoiceMessage, router])

  // Called when user picks a child from modal
  const handleChildSelected = useCallback((child: ChildResponse) => {
    setActiveChild(child)
    setShowChildModal(false)
    const pending = pendingMsgRef.current
    pendingMsgRef.current = null
    if (pending) {
      doSendMessage(pending, child)
    }
  }, [doSendMessage])

  if (checking) {
    return (
      <div className="flex h-dvh items-center justify-center bg-[#F4FCFB]">
        <div className="w-10 h-10 rounded-full border-[3px] border-[#52B788] border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <main className="flex flex-col h-dvh max-w-[430px] mx-auto bg-[#F4FCFB] overflow-hidden">
      <ChatHeader
        onNewChat={() => {
          // Reset active child so user picks again for new chat
          setActiveChild(null)
          if (allChildren.length > 1) {
            setShowChildModal(true)
          }
        }}
      />

      {/* Active child pill — show which child this chat is about */}
      {activeChild && (
        <div className="flex items-center gap-2 px-4 py-2 bg-white border-b border-[rgba(82,183,136,0.12)]">
          <div className="flex items-center gap-2 bg-[rgba(82,183,136,0.08)] px-3 py-1.5 rounded-full">
            <span className="text-sm">{activeChild.gender === 'MALE' ? '👦' : '👧'}</span>
            <span className="text-[13px] font-bold text-[#52B788]">{activeChild.name}</span>
            <span className="text-[11px] text-[#94A3B8]">의 상담</span>
          </div>
          {!consultationId && allChildren.length > 1 && (
            <button
              onClick={() => { pendingMsgRef.current = null; setShowChildModal(true) }}
              className="text-[11px] text-[#94A3B8] hover:text-[#52B788] transition-colors ml-auto"
            >
              변경
            </button>
          )}
          {consultationId && (
            <button
              onClick={async () => {
                if (confirm('대화를 종료하시겠습니까?')) {
                  try {
                    const { closeChat } = await import('@/lib/api')
                    await closeChat(Number(consultationId))
                    toast.success('대화가 종료되었습니다.')
                    router.push('/chats')
                  } catch (err) {
                    toast.error('대화 종료에 실패했습니다.')
                  }
                }
              }}
              className="text-[11px] text-white bg-[#FF5A5A] hover:bg-[#FF3B3B] px-3 py-1.5 rounded-full transition-colors font-bold ml-auto"
            >
              대화 종료하기
            </button>
          )}
        </div>
      )}

      <div className="flex-1 overflow-y-auto" id="messages-container">
        {messages.length === 0 ? (
          <WelcomeScreen
            onSampleClick={sendMessage}
            childName={activeChild?.name}
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
        onSendVoice={sendVoiceMessage}
        onImageUpload={setUploadedImg}
        uploadedImg={uploadedImg}
        disabled={isLoading}
      />

      <div className="text-center text-[10px] text-[#94A3B8] py-1 bg-white">
        AI 상담은 의사 진료를 대체하지 않습니다
      </div>
      <BottomNav />

      {/* Child Selection Modal */}
      <ChildSelectModal
        isOpen={showChildModal}
        children={allChildren}
        onSelect={handleChildSelected}
        onClose={() => {
          setShowChildModal(false)
          pendingMsgRef.current = null
        }}
        onAddChild={() => {
          setShowChildModal(false)
          router.push('/child-setup')
        }}
      />
    </main>
  )
}
