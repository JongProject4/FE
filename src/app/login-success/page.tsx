'use client'
// src/app/login-success/page.tsx
// 백엔드 OAuth2 로그인 성공 후 JWT 토큰을 받아와 저장하는 페이지
import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { setAccessToken } from '@/lib/api'
import { Suspense } from 'react'

function LoginSuccessHandler() {
    const router = useRouter()
    const searchParams = useSearchParams()

    useEffect(() => {
        const token = searchParams.get('token')

        if (token) {
            // JWT 토큰 저장
            setAccessToken(token)
            // 채팅 페이지로 이동
            router.replace('/chat')
        } else {
            // 토큰이 없으면 로그인 페이지로
            router.replace('/login')
        }
    }, [searchParams, router])

    return (
        <div className="flex h-dvh items-center justify-center bg-[#F5F8FF]">
            <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 rounded-full border-3 border-[#4A90D9] border-t-transparent animate-spin" />
                <p className="text-sm text-[#6B7A99]">로그인 처리 중...</p>
            </div>
        </div>
    )
}

export default function LoginSuccessPage() {
    return (
        <Suspense
            fallback={
                <div className="flex h-dvh items-center justify-center bg-[#F5F8FF]">
                    <div className="w-10 h-10 rounded-full border-3 border-[#4A90D9] border-t-transparent animate-spin" />
                </div>
            }
        >
            <LoginSuccessHandler />
        </Suspense>
    )
}
