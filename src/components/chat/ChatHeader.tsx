'use client'
// src/components/chat/ChatHeader.tsx
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'

export function ChatHeader() {
  const router = useRouter()

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-[rgba(74,144,217,0.12)] flex-shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 bg-[#EBF4FF] rounded-[10px] flex items-center justify-center overflow-hidden p-0.5">
          <img
            src="/logo.png"
            alt="Logo"
            className="w-full h-full object-contain"
          />
        </div>
        <span className="text-[20px] font-black tracking-tighter text-[#4A90D9]">AIYA</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => router.push('/calendar')}
          className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#F5F8FF] border border-[rgba(74,144,217,0.2)] text-[#4A90D9] active:scale-90 transition-transform"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </button>

        <button
          onClick={() => signOut()}
          className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#FFF0F0] border border-[rgba(255,100,100,0.2)] text-[#FF5A5A] active:scale-90 transition-transform"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>
    </header>
  )
}
