'use client'
// src/components/Providers.tsx
import { SessionProvider } from 'next-auth/react'
import { Toaster } from 'react-hot-toast'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#fff',
            color: '#1A2340',
            borderRadius: '12px',
            border: '1px solid rgba(74,144,217,0.2)',
            fontSize: '14px',
            fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
          },
          success: { iconTheme: { primary: '#52B788', secondary: '#fff' } },
          error: { iconTheme: { primary: '#EF4444', secondary: '#fff' } },
        }}
      />
    </SessionProvider>
  )
}
