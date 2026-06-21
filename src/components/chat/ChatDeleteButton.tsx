'use client'

import { useState } from 'react'

interface Props {
    chatId: number
    onDelete: (chatId: number) => Promise<boolean> | void
    className?: string
}

export function ChatDeleteButton({ chatId, onDelete, className = '' }: Props) {
    const [isDeleting, setIsDeleting] = useState(false)

    const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation()
        e.preventDefault()
        if (isDeleting) return
        setIsDeleting(true)
        try {
            await onDelete(chatId)
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <button
            type="button"
            onClick={handleClick}
            disabled={isDeleting}
            aria-label="상담 삭제"
            aria-busy={isDeleting}
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#94A3B8] transition-all hover:bg-[#FFF0F0] hover:text-[#FF5A5A] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        >
            {isDeleting ? (
                <div className="w-4 h-4 border-2 border-[#94A3B8] border-t-transparent rounded-full animate-spin" />
            ) : (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M3 6h18" />
                    <path d="M8 6V4h8v2" />
                    <path d="M19 6l-1 14H6L5 6" />
                    <path d="M10 11v6" />
                    <path d="M14 11v6" />
                </svg>
            )}
        </button>
    )
}
