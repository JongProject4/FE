'use client'

import { getCategoryLabel, getRiskBadgeClass, getRiskLabel } from '@/lib/chatLabels'
import { getChildColor } from '@/lib/childColors'
import type { ChatSession } from '@/lib/store'

interface Props {
    chat: ChatSession
    titleClassName?: string
}

export function ChatListItemMeta({ chat, titleClassName = '' }: Props) {
    const childColor = getChildColor(chat.childId || chat.childName)

    return (
        <>
            <div className={`truncate text-[#334155] group-hover:text-[#52B788] transition-colors ${titleClassName}`}>
                {chat.title}
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                <span
                    className="rounded-full px-2.5 py-0.5 text-[11px] font-bold"
                    style={{ backgroundColor: childColor.bg, color: childColor.text }}
                >
                    {chat.childName}
                </span>
                <span className="rounded-full bg-[rgba(82,183,136,0.12)] px-2 py-0.5 text-[10px] font-semibold text-[#52B788]">
                    {getCategoryLabel(chat.category)}
                </span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${getRiskBadgeClass(chat.riskLevel)}`}>
                    {getRiskLabel(chat.riskLevel)}
                </span>
                <span className="text-[11px] text-[#94A3B8]">
                    {chat.date}
                </span>
            </div>
        </>
    )
}
