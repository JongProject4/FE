'use client'
// src/app/chat/page.tsx
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { ChatHeader } from '@/components/chat/ChatHeader'
import { MessageList } from '@/components/chat/MessageList'
import { ChatInput } from '@/components/chat/ChatInput'
import { WelcomeScreen } from '@/components/chat/WelcomeScreen'
import { QuickChips } from '@/components/chat/QuickChips'
import toast from 'react-hot-toast'

export default function ChatPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const {
    selectedChildId, children, messages, consultationId,
    isLoading, addMessage, updateLastMessage, setConsultationId,
    setLoading, setChildren, setSelectedChild,
  } = useAppStore()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [uploadedImg, setUploadedImg] = useState<string | null>(null)

  // Auth guard
  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login')
  }, [status, router])

  // Load children
  useEffect(() => {
    if (!session?.user) return
    fetch('/api/children')
      .then((r) => r.json())
      .then((data) => {
        setChildren(data)
        if (data.length === 0) {
          router.push('/child-setup')
        } else {
          const isInvalidId = !selectedChildId || !data.find((c: any) => c.id === selectedChildId)
          if (isInvalidId) {
            setSelectedChild(data[0].id)
          }
        }
      })
      .catch(console.error)
  }, [session])

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const selectedChild = Array.isArray(children) ? children.find((c) => c.id === selectedChildId) : null

  const sendMessage = useCallback(async (text: string) => {
    if (!selectedChildId || isLoading) return
    if (!text.trim() && !uploadedImg) return

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
      content: '',
      timestamp: new Date().toISOString(),
      isStreaming: true,
    })

    try {
      const history = messages
        .filter((m) => !m.isStreaming)
        .slice(-10)
        .map((m) => ({ role: m.role, content: m.content }))

      history.push({ role: 'user', content: text })

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          childId: selectedChildId,
          consultationId,
          messages: history,
          imageUrl: uploadedImg,
        }),
      })

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const data = JSON.parse(line.slice(6))
            if (data.text) {
              accumulated += data.text
              updateLastMessage(accumulated, false)
            }
            if (data.done) {
              updateLastMessage(accumulated, true, data.riskLevel)
              setConsultationId(data.consultationId)
            }
            if (data.error) toast.error(data.error)
          } catch { }
        }
      }
    } catch (err) {
      updateLastMessage('죄송합니다. 오류가 발생했습니다. 다시 시도해주세요.', true)
      toast.error('연결 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }, [selectedChildId, isLoading, messages, consultationId, uploadedImg])

  if (status === 'loading') {
    return (
      <div className="flex h-dvh items-center justify-center bg-[#F5F8FF]">
        <div className="w-10 h-10 rounded-full border-[3px] border-[#4A90D9] border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <main className="flex flex-col h-dvh max-w-[430px] mx-auto bg-[#F5F8FF] overflow-hidden">
      <ChatHeader
        child={selectedChild}
        onChildChange={() => router.push('/child-setup')}
      />

      <div className="flex-1 overflow-y-auto" id="messages-container">
        {messages.length === 0 ? (
          <WelcomeScreen
            childName={selectedChild?.name}
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
        disabled={isLoading || !selectedChildId}
      />

      <div className="text-center text-[10px] text-[#A0AABF] py-1 bg-white">
        AI 상담은 의사 진료를 대체하지 않습니다
      </div>
    </main>
  )
}
