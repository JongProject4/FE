'use client'
// src/components/chat/ChatHeader.tsx
import { Child } from '@/lib/store'

interface Props {
  child?: Child
  onChildChange: () => void
}

function calcAge(birthdate: string): string {
  const b = new Date(birthdate)
  const now = new Date()
  let years = now.getFullYear() - b.getFullYear()
  let months = now.getMonth() - b.getMonth()
  if (months < 0) { years--; months += 12 }
  if (years === 0) return `${months}개월`
  return months > 0 ? `${years}세 ${months}개월` : `${years}세`
}

export function ChatHeader({ child, onChildChange }: Props) {
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

      {/* Child selector pill */}
      <button
        onClick={onChildChange}
        className="flex items-center gap-2 bg-[#EBF4FF] px-3 py-1.5 rounded-full border border-[#B8D9F5] active:scale-95 transition-transform"
      >
        {child ? (
          <>
            <div className="w-6 h-6 rounded-full bg-[#4A90D9] flex items-center justify-center text-[10px] font-bold text-white">
              {child.name.charAt(0)}
            </div>
            <div className="text-left">
              <div className="text-[13px] font-semibold text-[#4A90D9] leading-none">{child.name}</div>
              <div className="text-[10px] text-[#6B7A99] leading-none mt-0.5">
                {calcAge(child.birthdate)} · {child.gender === 'FEMALE' ? '여아' : '남아'}
              </div>
            </div>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4A90D9" strokeWidth="2.5">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </>
        ) : (
          <span className="text-[13px] font-semibold text-[#4A90D9]">아이 선택 ▾</span>
        )}
      </button>
    </header>
  )
}
