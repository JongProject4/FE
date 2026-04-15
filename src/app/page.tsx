// src/app/page.tsx
import { redirect } from 'next/navigation'

export default function HomePage() {
  // 항상 onboarding으로 리다이렉트
  // 클라이언트에서 JWT 토큰 확인 후 chat으로 이동
  redirect('/login')
}
