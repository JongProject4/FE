'use client'

import { AnimatePresence, motion } from 'framer-motion'

interface Props {
    open: boolean
    title: string
    description?: string
    confirmLabel?: string
    cancelLabel?: string
    onConfirm: () => void
    onCancel: () => void
    danger?: boolean
}

/**
 * 디자인 통일된 확인 다이얼로그. window.confirm 대체용.
 * radix-dialog 가 portal 까지 제공하지만 의존성 단순화를 위해
 * framer-motion + 자체 overlay 로 동일한 모양을 구현한다.
 */
export function ConfirmDialog({
    open,
    title,
    description,
    confirmLabel = '확인',
    cancelLabel = '취소',
    onConfirm,
    onCancel,
    danger = false,
}: Props) {
    return (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center px-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onCancel}
                        className="absolute inset-0 bg-[#1e293b]/40 backdrop-blur-[2px]"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.92, y: 16 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 8 }}
                        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
                        className="relative w-full max-w-[360px] bg-white rounded-[22px] shadow-[0_20px_60px_rgba(15,23,42,0.18)] overflow-hidden"
                    >
                        <div className="px-6 pt-6 pb-3">
                            <h2 className="text-[18px] font-black text-[#1e293b] tracking-tight">{title}</h2>
                            {description && (
                                <p className="text-[13px] text-[#475569] mt-2 leading-relaxed">{description}</p>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-2 px-4 pb-4 pt-2">
                            <button
                                type="button"
                                onClick={onCancel}
                                className="py-3 rounded-[14px] text-[14px] font-bold text-[#475569] bg-[#F1F5F9] hover:bg-[#E2E8F0] active:scale-[0.98] transition-all"
                            >
                                {cancelLabel}
                            </button>
                            <button
                                type="button"
                                onClick={onConfirm}
                                className={`py-3 rounded-[14px] text-[14px] font-bold text-white active:scale-[0.98] transition-all ${
                                    danger
                                        ? 'bg-[#FF5A5A] hover:bg-[#FF4444]'
                                        : 'bg-[#52B788] hover:bg-[#3FA374]'
                                }`}
                            >
                                {confirmLabel}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
