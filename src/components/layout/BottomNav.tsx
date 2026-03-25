'use client'
// src/components/layout/BottomNav.tsx
import { useRouter, usePathname } from 'next/navigation'

export function BottomNav() {
    const router = useRouter()
    const pathname = usePathname()

    const tabs = [
        {
            id: 'chat',
            label: '채팅',
            path: '/chat',
            icon: (active: boolean) => (
                <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "#4A90D9" : "none"} stroke={active ? "#4A90D9" : "#A0AABF"} strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
            )
        },
        {
            id: 'calendar',
            label: '캘린더',
            path: '/calendar',
            icon: (active: boolean) => (
                <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "#4A90D9" : "none"} stroke={active ? "#4A90D9" : "#A0AABF"} strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
            )
        },
    ]

    return (
        <nav className="flex items-center justify-around bg-white border-t border-[rgba(74,144,217,0.12)] py-2 px-6 flex-shrink-0">
            {tabs.map((tab) => {
                const active = pathname === tab.path
                return (
                    <button
                        key={tab.id}
                        onClick={() => router.push(tab.path)}
                        className="flex flex-col items-center gap-1 active:scale-90 transition-transform"
                    >
                        {tab.icon(active)}
                        <span className={`text-[10px] font-semibold ${active ? 'text-[#4A90D9]' : 'text-[#A0AABF]'}`}>
                            {tab.label}
                        </span>
                    </button>
                )
            })}
        </nav>
    )
}
