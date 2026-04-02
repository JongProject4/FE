'use client'

import { useSearchParams } from 'next/navigation'
import ChildProfileForm from '@/components/child/childprofileform'

export default function ChildEditPage() {
  const searchParams = useSearchParams()
  const childId = searchParams.get('childId')

  return <ChildProfileForm mode="edit" childId={childId} />
}