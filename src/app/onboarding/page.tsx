'use client'
// src/app/onboarding/page.tsx
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

const SLIDES = [
    {
        title: '우리아i 건강 관리',
        description: 'AIYA와 함께하는 스마트하고 건강한 일상으로의 시작',
        bg: 'from-[#52B788] to-[#74C69D]',
        icon: '✨'
    },
    {
        title: '24/7 AI 상담',
        description: '언제 어디서든 궁금한 점을 즉시 상담받으세요',
        bg: 'from-[#74C69D] to-[#52B788]',
        icon: '👨‍⚕️'
    },
    {
        title: '스마트한 일정 관리',
        description: '아이의 진료와 복약 일정을 꼼꼼하게 관리하세요',
        bg: 'from-[#52B788] to-[#40916C]',
        icon: '📅'
    },
    {
        title: '안전한 성장 기록',
        description: '소중한 우리 아이의 모든 정보를 안전하게 보관합니다',
        bg: 'from-[#40916C] to-[#2D6A4F]',
        icon: '🛡️'
    }
]

export default function OnboardingPage() {
    const router = useRouter()
    const [current, setCurrent] = useState(0)

    const nextSlide = useCallback(() => {
        if (current < SLIDES.length - 1) {
            setCurrent(c => c + 1)
        } else {
            router.push('/login')
        }
    }, [current, router])

    // Auto-play
    useEffect(() => {
        const timer = setInterval(() => {
            if (current < SLIDES.length - 1) {
                setCurrent(c => c + 1)
            }
        }, 4000)
        return () => clearInterval(timer)
    }, [current])

    return (
        <main className="relative flex flex-col h-dvh max-w-[430px] mx-auto bg-white overflow-hidden font-sans">
            <AnimatePresence mode="wait">
                <motion.div
                    key={current}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.6, ease: 'easeInOut' }}
                    className={`flex-1 flex flex-col items-center justify-center px-8 bg-gradient-to-br ${SLIDES[current].bg} text-white`}
                >
                    <div className="w-32 h-32 bg-white/20 backdrop-blur-md rounded-[40px] flex items-center justify-center text-6xl mb-12 shadow-2xl">
                        {SLIDES[current].icon}
                    </div>
                    <h1 className="text-[28px] font-black mb-4 text-center leading-tight tracking-tight">
                        {SLIDES[current].title}
                    </h1>
                    <p className="text-[16px] opacity-90 text-center leading-relaxed font-medium px-4">
                        {SLIDES[current].description}
                    </p>
                </motion.div>
            </AnimatePresence>

            {/* Footer controls */}
            <div className="absolute bottom-10 left-0 right-0 px-8 flex flex-col items-center gap-8">
                {/* Indicators */}
                <div className="flex gap-2.5">
                    {SLIDES.map((_, i) => (
                        <div
                            key={i}
                            className={`h-2 rounded-full transition-all duration-300 ${i === current ? 'w-8 bg-white shadow-md' : 'w-2 bg-white/40'
                                }`}
                        />
                    ))}
                </div>

                {/* Buttons */}
                <div className="flex w-full gap-3">
                    {current < SLIDES.length - 1 ? (
                        <>
                            <button
                                onClick={() => router.push('/login')}
                                className="flex-1 py-4 text-[15px] font-bold text-white/80 hover:text-white transition-colors"
                            >
                                건너뛰기
                            </button>
                            <button
                                onClick={nextSlide}
                                className="flex-[2] py-4 bg-white text-[#52B788] rounded-2xl text-[16px] font-black shadow-xl active:scale-[0.98] transition-transform"
                            >
                                다음으로
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => router.push('/login')}
                            className="w-full py-4 bg-white text-[#52B788] rounded-2xl text-[17px] font-black shadow-xl active:scale-[0.98] transition-all animate-pulse"
                        >
                            시작하기
                        </button>
                    )}
                </div>
            </div>
        </main>
    )
}
