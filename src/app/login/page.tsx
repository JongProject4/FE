'use client'
// src/app/login/page.tsx
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

const SLIDES = [
  {
    title: '우리아이 건강 관리',
    description: 'AIYA와 함께하는 스마트하고 건강한 일상으로의 시작',
    bg: 'from-[#4A90D9] to-[#63A4FF]',
    icon: '✨'
  },
  {
    title: '24/7 AI 상담',
    description: '언제 어디서든 궁금한 점을 즉시 상담받으세요',
    bg: 'from-[#63A4FF] to-[#00C9FF]',
    icon: '👨‍⚕️'
  },
  {
    title: '스마트한 일정 관리',
    description: '아이의 진료와 복약 일정을 꼼꼼하게 관리하세요',
    bg: 'from-[#00C9FF] to-[#52B788]',
    icon: '📅'
  }
]

export default function LoginPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [step, setStep] = useState(0) // 0, 1, 2 are slides, 3 is login

  useEffect(() => {
    if (status === 'authenticated') router.replace('/chat')
  }, [status, router])

  // Auto-play for onboarding steps
  useEffect(() => {
    if (step < 3) {
      const timer = setInterval(() => {
        setStep(s => (s < 3 ? s + 1 : s))
      }, 4000)
      return () => clearInterval(timer)
    }
  }, [step])

  const handleLogin = async (provider: string) => {
    setLoading(provider)
    try {
      await signIn(provider, { callbackUrl: '/chat' })
    } catch {
      setLoading(null)
    }
  }

  if (status === 'loading') {
    return (
      <div className="flex h-dvh items-center justify-center bg-[#F5F8FF]">
        <div className="w-10 h-10 rounded-full border-3 border-[#4A90D9] border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <main className="relative flex flex-col h-dvh max-w-[430px] mx-auto bg-white overflow-hidden font-sans">
      <AnimatePresence mode="wait">
        {step < 3 ? (
          <motion.div
            key={`slide-${step}`}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            className={`flex-1 flex flex-col items-center justify-center px-8 bg-gradient-to-br ${SLIDES[step].bg} text-white`}
          >
            <div className="w-32 h-32 bg-white/20 backdrop-blur-md rounded-[40px] flex items-center justify-center text-6xl mb-12 shadow-2xl">
              {SLIDES[step].icon}
            </div>
            <h1 className="text-[28px] font-black mb-4 text-center leading-tight tracking-tight">
              {SLIDES[step].title}
            </h1>
            <p className="text-[16px] opacity-90 text-center leading-relaxed font-medium px-4">
              {SLIDES[step].description}
            </p>

            {/* Indicators */}
            <div className="absolute bottom-32 flex gap-2.5">
              {[0, 1, 2, 3].map((_, i) => (
                <div
                  key={i}
                  className={`h-2 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-white shadow-md' : 'w-2 bg-white/40'
                    }`}
                />
              ))}
            </div>

            <div className="absolute bottom-10 left-0 right-0 px-8 flex gap-3">
              <button
                onClick={() => setStep(3)}
                className="flex-1 py-4 text-[15px] font-bold text-white/80 hover:text-white transition-colors"
              >
                건너뛰기
              </button>
              <button
                onClick={() => setStep(s => s + 1)}
                className="flex-[2] py-4 bg-white text-[#4A90D9] rounded-2xl text-[16px] font-black shadow-xl active:scale-[0.98] transition-transform"
              >
                다음으로
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="login"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex-1 flex flex-col h-full overflow-y-auto"
          >
            <div className="flex-1 flex flex-col items-center justify-center px-8 pt-12 pb-8">
              {/* Logo */}
              <div className="w-20 h-20 rounded-[22px] bg-[#EBF4FF] flex items-center justify-center mb-6 shadow-sm overflow-hidden p-1">
                <Image
                  src="/logo.png"
                  alt="Logo"
                  width={80}
                  height={80}
                  className="object-contain"
                />
              </div>

              <h1 className="text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-[#4A90D9] via-[#52A8E8] to-[#52B788] text-center mb-2">
                AIYA
              </h1>
              <p className="text-sm text-[#6B7A99] text-center leading-relaxed mb-8">
                아이의 건강을 위한<br />스마트한 의료 상담 파트너
              </p>

              {/* Login Buttons */}
              <div className="w-full flex flex-col gap-3">
                <button
                  onClick={() => handleLogin('google')}
                  disabled={!!loading}
                  className="w-full flex items-center justify-center gap-3 px-4 py-[14px] bg-white border border-[rgba(74,144,217,0.2)] rounded-2xl text-[15px] font-semibold text-[#1A2340] active:scale-[0.98] transition-all disabled:opacity-60"
                >
                  {loading === 'google' ? (
                    <div className="w-5 h-5 border-2 border-[#4A90D9] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                  )}
                  Google로 계속하기
                </button>

                <button
                  onClick={() => handleLogin('apple')}
                  disabled={!!loading}
                  className="w-full flex items-center justify-center gap-3 px-4 py-[14px] bg-[#1A2340] rounded-2xl text-[15px] font-semibold text-white active:scale-[0.98] transition-all disabled:opacity-60"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                  </svg>
                  Apple로 계속하기
                </button>

                <button
                  onClick={() => handleLogin('kakao')}
                  disabled={!!loading}
                  className="w-full flex items-center justify-center gap-3 px-4 py-[14px] bg-[#FEE500] rounded-2xl text-[15px] font-semibold text-[#191919] active:scale-[0.98] transition-all disabled:opacity-60"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#191919">
                    <path d="M12 3C6.48 3 2 6.59 2 11.01c0 2.82 1.83 5.29 4.58 6.72L5.5 21.5l4.64-2.74c.61.08 1.23.13 1.86.13 5.52 0 10-3.59 10-8.01S17.52 3 12 3z" />
                  </svg>
                  카카오로 계속하기
                </button>

                <div className="flex items-center gap-4 my-2">
                  <div className="h-[1px] flex-1 bg-[rgba(74,144,217,0.1)]" />
                  <span className="text-[12px] text-[#A0AABF]">또는</span>
                  <div className="h-[1px] flex-1 bg-[rgba(74,144,217,0.1)]" />
                </div>

                <button
                  onClick={() => handleLogin('credentials')}
                  disabled={!!loading}
                  className="w-full flex items-center justify-center gap-3 px-4 py-[14px] bg-[#F5F8FF] border border-dashed border-[#4A90D9] rounded-2xl text-[15px] font-semibold text-[#4A90D9] active:scale-[0.98] transition-all disabled:opacity-60"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  게스트로 로그인하기 (임시)
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 pb-8 pt-4 text-center">
              <p className="text-xs text-[#A0AABF] leading-relaxed">
                로그인 시 <span className="text-[#4A90D9]">이용약관</span> 및{' '}
                <span className="text-[#4A90D9]">개인정보처리방침</span>에 동의하게 됩니다.<br />
                이 서비스는 의사의 진료를 대체하지 않습니다.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
