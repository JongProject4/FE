'use client'
// src/app/chats/page.tsx
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/lib/store'
import { getChildren, getChatRooms, getChatHistory } from '@/lib/api'
import { BottomNav } from '@/components/layout/BottomNav'

export default function ChatsPage() {
    const router = useRouter()
    const {
        setConsultationId, setMessages,
        chatSessions, setChatSessions, historyLoaded, setHistoryLoaded
    } = useAppStore()
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(false)

    // Backend'dan to'liq tarixni yuklash
    const loadHistory = async (forceRefresh = false) => {
        if (historyLoaded && !forceRefresh && chatSessions.length > 0) {
            return // Use cached data
        }

        setLoading(true)
        try {
            const children = await getChildren()
            if (children.length > 0) {
                const allMapped: typeof chatSessions = []

                for (const child of children) {
                    const roomIds = await getChatRooms(child.id)
                    if (Array.isArray(roomIds)) {
                        // Backend might return objects [{chatId: 1}] or numbers [1, 2]
                        const parsedIds = roomIds.map((item: any) =>
                            typeof item === 'object' && item !== null ? (item.chatId || item.id) : item
                        ).map(Number).filter(id => !isNaN(id))

                        const sortedIds = [...parsedIds].sort((a, b) => b - a)

                        for (const id of sortedIds) {
                            let title = `${child.name}의 상담 #${id}`
                            try {
                                const messages = await getChatHistory(id)
                                const firstUserMsg = messages.find(m => m.role === 'USER')
                                if (firstUserMsg) {
                                    title = firstUserMsg.content.length > 30
                                        ? firstUserMsg.content.substring(0, 30) + '...'
                                        : firstUserMsg.content
                                }
                            } catch (e) {
                                console.error(`Failed to load title for chat ${id}`, e)
                            }

                            allMapped.push({
                                id,
                                title,
                                date: new Date().toLocaleDateString('ko-KR'),
                                childName: child.name,
                            })
                        }
                    }
                }
                const sorted = allMapped.sort((a, b) => b.id - a.id)
                setChatSessions(sorted)
                setHistoryLoaded(true)
            } else {
                setChatSessions([])
                setHistoryLoaded(true)
            }
        } catch (err) {
            console.error('History load failed', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadHistory()
    }, [])

    const filteredChats = chatSessions.filter(chat =>
        chat.title.toLowerCase().includes(search.toLowerCase()) ||
        chat.childName.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <main className="flex flex-col h-dvh max-w-[430px] mx-auto bg-[#F4FCFB] overflow-hidden relative">
            {/* Top Navigation */}
            <header className="flex items-center justify-between px-4 pt-6 pb-2">
                <button
                    onClick={() => router.back()}
                    className="w-10 h-10 flex flex-col items-center justify-center gap-[5px] text-[#334155] active:scale-95 transition-all"
                >
                    <div className="w-5 h-[2px] bg-current rounded-full" />
                    <div className="w-5 h-[2px] bg-current rounded-full" />
                    <div className="w-5 h-[2px] bg-current rounded-full" />
                </button>

                {/* Refresh button */}
                <button
                    onClick={() => loadHistory(true)}
                    disabled={loading}
                    title="새로고침"
                    className="w-10 h-10 flex items-center justify-center text-[#94A3B8] hover:text-[#52B788] transition-colors disabled:opacity-40"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={loading ? 'animate-spin' : ''}>
                        <path d="M21 12a9 9 0 1 1-6.22-8.56" />
                        <polyline points="21 3 21 9 15 9" />
                    </svg>
                </button>
            </header>

            {/* Title */}
            <div className="px-5 mb-5 mt-2">
                <h1 className="text-[32px] font-black text-[#334155] tracking-tighter">상담 목록</h1>
                <p className="text-[13px] text-[#94A3B8] mt-1">총 {chatSessions.length}개의 상담</p>
            </div>

            {/* Search Input */}
            <div className="px-5 mb-4">
                <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="상담 기록 검색..."
                        className="w-full pl-11 pr-4 py-3.5 bg-white border border-[rgba(82,183,136,0.2)] rounded-[16px] text-[15px] text-[#334155] focus:border-[#52B788] focus:shadow-sm outline-none placeholder-[#94A3B8] transition-all"
                    />
                </div>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto px-2 pb-[100px]">
                {loading && chatSessions.length === 0 ? (
                    <div className="py-10 text-center">
                        <div className="inline-block w-8 h-8 rounded-full border-[2.5px] border-[#52B788] border-t-transparent animate-spin mb-3" />
                        <p className="text-[14px] text-[#94A3B8]">상담 기록을 불러오는 중...</p>
                    </div>
                ) : filteredChats.length > 0 ? (
                    filteredChats.map((chat) => (
                        <button
                            key={chat.id}
                            onClick={() => {
                                setConsultationId(String(chat.id))
                                setMessages([]) // Clear local messages, ChatPage will load them
                                router.push('/chat')
                            }}
                            className="w-full text-left px-4 py-3.5 mb-1 rounded-2xl hover:bg-[rgba(82,183,136,0.06)] active:scale-[0.98] transition-all group"
                        >
                            <div className="text-[16px] font-bold text-[#334155] group-hover:text-[#52B788] truncate mb-1 transition-colors">{chat.title}</div>
                            <div className="text-[13px] text-[#94A3B8] font-medium">{chat.childName} · {chat.date}</div>
                        </button>
                    ))
                ) : (
                    <div className="py-10 text-center text-[#94A3B8] font-medium text-[14px]">
                        {search ? '검색 결과가 없습니다.' : '상담 내역이 없습니다.'}
                    </div>
                )}
            </div>

            {/* Floating Action Button (New Chat) */}
            <button
                onClick={() => {
                    useAppStore.getState().clearMessages()
                    router.push('/chat')
                }}
                className="absolute bottom-[90px] right-5 flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-to-r from-[#52B788] to-[#6EE7B7] hover:opacity-90 active:scale-95 transition-all rounded-[24px] shadow-[0_8px_20px_rgba(82,183,136,0.3)] text-white font-bold"
            >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
                    <line x1="12" y1="8" x2="12" y2="16" />
                    <line x1="8" y1="12" x2="16" y2="12" />
                </svg>
                <span className="text-[15px]">새 상담</span>
            </button>

            <BottomNav />
        </main>
    )
}
