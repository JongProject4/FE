'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import ChildProfileForm from '@/components/child/childprofileform'

function ChildEditContent() {
  const searchParams = useSearchParams()
  const childId = searchParams.get('childId')

  return <ChildProfileForm mode="edit" childId={childId} />
}

export default function ChildEditPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-dvh items-center justify-center bg-[#F4FCFB]">
          <div className="w-10 h-10 rounded-full border-[3px] border-[#52B788] border-t-transparent animate-spin" />
        </div>
      }
    >
      <ChildEditContent />
    </Suspense>
  )
}