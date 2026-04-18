// src/lib/store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Child {
  id: string
  name: string
  birthdate: string
  gender: 'MALE' | 'FEMALE'
  weight?: number | null
  allergies?: string | null
}

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  imageUrl?: string
  timestamp: string
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH'
  isStreaming?: boolean
}

interface AppStore {
  selectedChildId: string | null
  children: Child[]
  messages: Message[]
  consultationId: string | null
  isLoading: boolean

  setSelectedChild: (id: string) => void
  setChildren: (children: Child[]) => void
  addMessage: (msg: Message) => void
  updateLastMessage: (content: string, done?: boolean, riskLevel?: string) => void
  clearMessages: () => void
  setConsultationId: (id: string | null) => void
  setMessages: (messages: Message[]) => void
  setLoading: (v: boolean) => void
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      selectedChildId: null,
      children: [],
      messages: [],
      consultationId: null,
      isLoading: false,

      setSelectedChild: (id) => set({ selectedChildId: id, messages: [], consultationId: null }),
      setChildren: (children) => set({ children }),
      addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
      updateLastMessage: (content, done, riskLevel) =>
        set((s) => {
          const msgs = [...s.messages]
          const last = msgs[msgs.length - 1]
          if (last && last.role === 'assistant') {
            msgs[msgs.length - 1] = {
              ...last,
              content,
              isStreaming: !done,
              riskLevel: (riskLevel as any) || last.riskLevel,
            }
          }
          return { messages: msgs }
        }),
      clearMessages: () => set({ messages: [], consultationId: null }),
      setConsultationId: (id) => set({ consultationId: id }),
      setMessages: (messages) => set({ messages }),
      setLoading: (v) => set({ isLoading: v }),
    }),
    {
      name: 'pediatric-ai-store',
      partialize: (s) => ({ selectedChildId: s.selectedChildId, children: s.children }),
    }
  )
)
