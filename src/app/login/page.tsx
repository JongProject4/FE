'use client'
// src/app/login/page.tsx
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { getAccessToken, getGoogleLoginUrl } from '@/lib/api'

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
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(0) // 0, 1, 2 are slides, 3 is login
  const [checking, setChecking] = useState(true)

  // 이미 로그인되어 있으면 채팅으로 이동
  useEffect(() => {
    const token = getAccessToken()
    if (token) {
      router.replace('/chat')
    } else {
      setChecking(false)
    }
  }, [router])

  // Auto-play for onboarding steps
  useEffect(() => {
    if (step < 3) {
      const timer = setInterval(() => {
        setStep(s => (s < 3 ? s + 1 : s))
      }, 4000)
      return () => clearInterval(timer)
    }
  }, [step])

  const handleGoogleLogin = () => {
    setLoading(true)
    // 백엔드 Spring Boot의 OAuth2 로그인 URL로 리다이렉트
    window.location.href = getGoogleLoginUrl()
  }

  if (checking) {
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

              {/* Login Button - Google Only */}
              <div className="w-full flex flex-col gap-3">
                <button
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 px-4 py-[16px] bg-white border border-[rgba(74,144,217,0.2)] rounded-2xl text-[15px] font-semibold text-[#1A2340] shadow-sm hover:shadow-md active:scale-[0.98] transition-all disabled:opacity-60"
                >
                  {loading ? (
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
