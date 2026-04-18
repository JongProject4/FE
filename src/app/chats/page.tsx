'use client'
// src/app/chats/page.tsx
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { BottomNav } from '@/components/layout/BottomNav'
import { ChatHeader } from '@/components/chat/ChatHeader' // reuse or create a custom header

export default function ChatsPage() {
    const router = useRouter()
    const [search, setSearch] = useState('')
    const [chats, setChats] = useState<{ id: number, title: string, date: string }[]>([])
    const [loading, setLoading] = useState(true)

    // 백엔드에서 실시간 상담 목록 로드
    useEffect(() => {
        const loadHistory = async () => {
            try {
                const { getChildren, getChatRooms } = await import('@/lib/api')
                const children = await getChildren()
                if (children.length > 0) {
                    const roomIds = await getChatRooms(children[0].id)
                    const mapped = roomIds.map(id => ({
                        id,
                        title: `상담 #${id}`,
                        date: '최근 상담' // 백엔드에서 날짜 정보를 안주므로 일단 고정
                    }))
                    setChats(mapped)
                }
            } catch (err) {
                console.error('History load failed', err)
            } finally {
                setLoading(false)
            }
        }
        loadHistory()
    }, [])

    const filteredChats = chats.filter(chat =>
        chat.title.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <main className="flex flex-col h-dvh max-w-[430px] mx-auto bg-[#F4FCFB] overflow-hidden relative">
            {/* Top Navigation - Similar to Claude */}
            <header className="flex items-center justify-between px-4 pt-6 pb-2">
                <button
                    onClick={() => router.back()}
                    className="w-10 h-10 flex flex-col items-center justify-center gap-[5px] text-[#334155] active:scale-95 transition-all"
                >
                    <div className="w-5 h-[2px] bg-current rounded-full" />
                    <div className="w-5 h-[2px] bg-current rounded-full" />
                    <div className="w-5 h-[2px] bg-current rounded-full" />
                </button>

                <button className="w-10 h-10 flex items-center justify-center text-[#334155] active:scale-95 transition-all">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="4" y1="21" x2="4" y2="14" />
                        <line x1="4" y1="10" x2="4" y2="3" />
                        <line x1="12" y1="21" x2="12" y2="12" />
                        <line x1="12" y1="8" x2="12" y2="3" />
                        <line x1="20" y1="21" x2="20" y2="16" />
                        <line x1="20" y1="12" x2="20" y2="3" />
                        <line x1="1" y1="14" x2="7" y2="14" />
                        <line x1="9" y1="8" x2="15" y2="8" />
                        <line x1="17" y1="16" x2="23" y2="16" />
                    </svg>
                </button>
            </header>

            {/* Title */}
            <div className="px-5 mb-5 mt-2">
                <h1 className="text-[32px] font-black text-[#334155] tracking-tighter">상담 목록</h1>
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
                {filteredChats.map((chat) => (
                    <button
                        key={chat.id}
                        onClick={() => router.push('/chat')}
                        className="w-full text-left px-4 py-3.5 mb-1 rounded-2xl hover:bg-[rgba(82,183,136,0.06)] active:scale-[0.98] transition-all group"
                    >
                        <div className="text-[16px] font-bold text-[#334155] group-hover:text-[#52B788] truncate mb-1 transition-colors">{chat.title}</div>
                        <div className="text-[13px] text-[#94A3B8] font-medium">{chat.date}</div>
                    </button>
                ))}
                {filteredChats.length === 0 && (
                    <div className="py-10 text-center text-[#94A3B8] font-medium text-[14px]">
                        검색 결과가 없습니다.
                    </div>
                )}
            </div>

            {/* Floating Action Button (New Chat) */}
            <button
                onClick={() => router.push('/chat')}
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
