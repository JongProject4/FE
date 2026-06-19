'use client'

import { getChildColor } from '@/lib/childColors'

interface Props {
  consultationChildIds: string[]
  clinicCount: number
}

export function EventDots({ consultationChildIds, clinicCount }: Props) {
  if (consultationChildIds.length + clinicCount === 0) return null

  return (
    <div className="mt-1 flex flex-wrap justify-center gap-[3px] max-w-full px-0.5">
      {consultationChildIds.map((childId, i) => (
        <div
          key={`c-${childId}-${i}`}
          className="w-[5px] h-[5px] rounded-full shrink-0"
          style={{ backgroundColor: getChildColor(childId).dot }}
        />
      ))}
      {Array.from({ length: clinicCount }).map((_, i) => (
        <div key={`h-${i}`} className="w-[5px] h-[5px] rounded-full bg-[#E24B4A] shrink-0" />
      ))}
    </div>
  )
}
