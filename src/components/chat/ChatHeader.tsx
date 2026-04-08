'use client'
// src/components/chat/ChatHeader.tsx
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession } from 'next-auth/react'

const MOCK_HISTORY = [
  { id: 1, title: '열이 38도까지 올라가요', date: '오늘' },
  { id: 2, title: '계속 기침을 하고 밤에 잠을 못자요', date: '어제' },
  { id: 3, title: '예방접종 후 미열 상담', date: '지난 주' },
  { id: 4, title: '우유 알레르기 증상 문의', date: '지난 주' },
  { id: 5, title: '아이 두통 상담', date: '지난 주' },
]

export function ChatHeader() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const { data: session } = useSession()

  // get user's first letter
  const userInitial = session?.user?.name ? session.user.name.charAt(0).toUpperCase() : 'A'
  const userName = session?.user?.name || 'User'

  return (
    <>
      <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-[rgba(82,183,136,0.12)] flex-shrink-0 relative z-40">
        <div className="flex items-center gap-3">
          {/* Hamburger Menu (Left) */}
          <button
            onClick={() => setIsOpen(true)}
            className="w-10 h-10 flex flex-col items-center justify-center gap-[5px] rounded-xl hover:bg-[rgba(82,183,136,0.08)] active:scale-95 transition-all text-[#334155]"
          >
            <div className="w-5 h-[2px] bg-current rounded-full" />
            <div className="w-5 h-[2px] bg-current rounded-full" />
            <div className="w-5 h-[2px] bg-current rounded-full" />
          </button>

          {/* Header Logo */}
          <div className="flex items-center gap-2">
            <span className="text-[22px] font-black tracking-tight text-[#52B788] serif">AIYA</span>
          </div>
        </div>
      </header>

      {/* Full screen bounded drawer container */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 m-auto max-w-[430px] h-dvh flex justify-start z-[999] overflow-hidden pointer-events-none">

            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-[#334155]/30 pointer-events-auto"
            />

            {/* Left Sliding Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className="relative w-[82%] max-w-[320px] h-full bg-white flex flex-col shadow-[10px_0_30px_rgba(0,0,0,0.08)] pointer-events-auto overflow-hidden"
            >
              {/* Sidebar Header (Logo) */}
              <div className="px-5 pt-8 pb-6 bg-white">
                <h1 className="text-[28px] font-black text-[#52B788] tracking-tighter">AIYA</h1>
              </div>

              {/* Main Menu Links */}
              <div className="px-3 flex flex-col gap-1 pb-4">
                <button
                  onClick={() => { setIsOpen(false); router.push('/chat') }}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-[rgba(82,183,136,0.08)] active:bg-[rgba(82,183,136,0.12)] transition-colors text-left"
                >
                  <div className="text-[#52B788]">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
                      <line x1="12" y1="8" x2="12" y2="16" />
                      <line x1="8" y1="12" x2="16" y2="12" />
                    </svg>
                  </div>
                  <span className="text-[16px] font-bold text-[#52B788]">새 상담</span>
                </button>

                <button
                  onClick={() => { setIsOpen(false); router.push('/chats') }}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-[rgba(82,183,136,0.08)] active:bg-[rgba(82,183,136,0.12)] transition-colors text-left"
                >
                  <div className="text-[#475569]">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                    </svg>
                  </div>
                  <span className="text-[16px] font-semibold text-[#475569]">상담 목록</span>
                </button>
              </div>

              <div className="border-t border-[rgba(82,183,136,0.12)] mx-5" />

              {/* Recents Section */}
              <div className="flex-1 overflow-y-auto px-2 pt-6 pb-2">
                <h2 className="px-4 text-[13px] font-bold text-[#52B788] mb-2 uppercase tracking-wider">최근 상담</h2>
                <div className="space-y-0.5 mt-3">
                  {MOCK_HISTORY.map((chat) => (
                    <button key={chat.id} className="w-full text-left py-3 px-4 rounded-xl hover:bg-[rgba(82,183,136,0.06)] active:scale-[0.98] transition-all truncate text-[14px] font-medium text-[#334155]">
                      {chat.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Profile / Logout Footer */}
              <div className="p-3 bg-white border-t border-[rgba(82,183,136,0.12)]">
                <div className="flex items-center justify-between p-2 rounded-xl hover:bg-[#FFF0F0] text-[#475569] hover:text-[#FF5A5A] transition-colors cursor-pointer group" onClick={() => signOut()}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[rgba(82,183,136,0.12)] flex items-center justify-center text-[#52B788] text-[15px] font-bold group-hover:bg-[#FF5A5A] group-hover:text-white transition-colors">
                      {userInitial}
                    </div>
                    <span className="text-[15px] font-bold">로그아웃</span>
                  </div>
                  <button className="w-8 h-8 flex items-center justify-center opacity-50 group-hover:opacity-100 transition-opacity">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
