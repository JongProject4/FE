// src/app/page.tsx
import { redirect } from 'next/navigation'

type HomePageProps = {
  searchParams?: {
    token?: string
    jwt?: string
  }
}

export default function HomePage({ searchParams }: HomePageProps) {
  // Backward compatibility:
  // if backend redirects with /?jwt=... or /?token=..., normalize it.
  const token = searchParams?.token || searchParams?.jwt
  if (token) {
    redirect(`/login-success?token=${encodeURIComponent(token)}`)
  }

  redirect('/login')
}
