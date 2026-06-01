'use client'
// src/components/chat/ChildSelectModal.tsx
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChildResponse } from '@/lib/api'

interface Props {
    isOpen: boolean
    children: ChildResponse[]
    onSelect: (child: ChildResponse) => void
    onClose: () => void
    onAddChild: () => void
}

function getAge(birthdate: string): string {
    try {
        const birth = new Date(birthdate)
        const now = new Date()
        let years = now.getFullYear() - birth.getFullYear()
        const months = now.getMonth() - birth.getMonth()
        if (months < 0 || (months === 0 && now.getDate() < birth.getDate())) years--
        const totalMonths = (now.getFullYear() - birth.getFullYear()) * 12 + now.getMonth() - birth.getMonth()
        if (years < 1) return `${totalMonths}개월`
        return `${years}세`
    } catch {
        return ''
    }
}

const GENDER_ICON: Record<string, string> = {
    MALE: '👦',
    FEMALE: '👧',
}

const AVATAR_COLORS = [
    'from-[#52B788] to-[#6EE7B7]',
    'from-[#6366F1] to-[#A5B4FC]',
    'from-[#F59E0B] to-[#FCD34D]',
    'from-[#EF4444] to-[#FCA5A5]',
    'from-[#8B5CF6] to-[#C4B5FD]',
]

export function ChildSelectModal({ isOpen, children, onSelect, onClose, onAddChild }: Props) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 m-auto max-w-[430px] h-dvh flex items-end z-[999] pointer-events-none">
                    {/* Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-[#1e293b]/40 backdrop-blur-[2px] pointer-events-auto"
                    />

                    {/* Bottom Sheet */}
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 260 }}
                        className="relative w-full bg-white rounded-t-[28px] shadow-[0_-20px_60px_rgba(0,0,0,0.15)] pointer-events-auto overflow-hidden"
                    >
                        {/* Handle */}
                        <div className="flex justify-center pt-3 pb-1">
                            <div className="w-10 h-1 bg-[#E2E8F0] rounded-full" />
                        </div>

                        {/* Header */}
                        <div className="px-6 pt-3 pb-5">
                            <h2 className="text-[20px] font-black text-[#1e293b] tracking-tight">누구의 상담인가요?</h2>
                            <p className="text-[13px] text-[#94A3B8] mt-1">AI가 아이의 정보를 바탕으로 맞춤 상담을 제공합니다</p>
                        </div>

                        {/* Children list */}
                        <div className="px-4 pb-4 flex flex-col gap-2 max-h-[50vh] overflow-y-auto">
                            {children.map((child, idx) => {
                                const avatarGradient = AVATAR_COLORS[idx % AVATAR_COLORS.length]
                                const age = getAge(child.birthdate)
                                const icon = GENDER_ICON[child.gender] || '🧒'

                                return (
                                    <button
                                        key={child.id}
                                        onClick={() => onSelect(child)}
                                        className="flex items-center gap-4 p-4 rounded-[18px] border border-[rgba(82,183,136,0.15)] hover:border-[#52B788] hover:bg-[rgba(82,183,136,0.04)] active:scale-[0.98] transition-all group"
                                    >
                                        {/* Avatar */}
                                        <div className={`w-14 h-14 rounded-[16px] bg-gradient-to-br ${avatarGradient} flex items-center justify-center text-[26px] flex-shrink-0 shadow-sm`}>
                                            {icon}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 text-left">
                                            <div className="text-[16px] font-bold text-[#1e293b] group-hover:text-[#52B788] transition-colors">{child.name}</div>
                                            <div className="text-[13px] text-[#64748B] mt-0.5 flex items-center gap-2">
                                                <span>{age}</span>
                                                {child.allergies && (
                                                    <>
                                                        <span className="w-1 h-1 rounded-full bg-[#CBD5E1] inline-block" />
                                                        <span className="text-[#F59E0B] font-medium">알레르기 있음</span>
                                                    </>
                                                )}
                                            </div>
                                            {child.medicalHistory && (
                                                <div className="text-[11px] text-[#94A3B8] mt-1 truncate max-w-[180px]">{child.medicalHistory}</div>
                                            )}
                                        </div>

                                        {/* Arrow */}
                                        <div className="text-[#94A3B8] group-hover:text-[#52B788] transition-colors">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M9 18l6-6-6-6" />
                                            </svg>
                                        </div>
                                    </button>
                                )
                            })}

                            {/* Add child button */}
                            <button
                                onClick={onAddChild}
                                className="flex items-center gap-4 p-4 rounded-[18px] border border-dashed border-[rgba(82,183,136,0.4)] hover:border-[#52B788] hover:bg-[rgba(82,183,136,0.04)] active:scale-[0.98] transition-all group"
                            >
                                <div className="w-14 h-14 rounded-[16px] bg-[rgba(82,183,136,0.08)] flex items-center justify-center flex-shrink-0">
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#52B788" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10" />
                                        <line x1="12" y1="8" x2="12" y2="16" />
                                        <line x1="8" y1="12" x2="16" y2="12" />
                                    </svg>
                                </div>
                                <div className="flex-1 text-left">
                                    <div className="text-[16px] font-bold text-[#52B788]">아이 추가하기</div>
                                    <div className="text-[13px] text-[#94A3B8] mt-0.5">새로운 아이를 등록합니다</div>
                                </div>
                            </button>
                        </div>

                        <div className="h-safe pb-6" />
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
