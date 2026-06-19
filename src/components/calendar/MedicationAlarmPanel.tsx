'use client'

import { useEffect, useState } from 'react'
import type { MedicationAlarmResponse } from '@/lib/api'
import { getChildColor } from '@/lib/childColors'
import {
  formatRemaining,
  getLastTakenAt,
  getRemainingMs,
  markMedicationTaken,
} from '@/lib/medicationTakenStorage'

export interface MedicationAlarmWithChild extends MedicationAlarmResponse {
  childName: string
}

interface Props {
  alarms: MedicationAlarmWithChild[]
  onAdd: () => void
  onDelete?: (childId: number, alarmId: number) => void
}

function CountdownRing({ remainingMs, intervalHour }: { remainingMs: number; intervalHour: number }) {
  const intervalMs = intervalHour * 60 * 60 * 1000
  const progress = intervalMs > 0 ? 1 - remainingMs / intervalMs : 0
  const radius = 26
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - Math.min(1, Math.max(0, progress)))

  return (
    <div className="relative w-[60px] h-[60px] shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 60 60">
        <circle cx="30" cy="30" r={radius} fill="none" stroke="#E2E8F0" strokeWidth="4" />
        <circle
          cx="30"
          cy="30"
          r={radius}
          fill="none"
          stroke="#52B788"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#52B788" strokeWidth="2">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
        <span className="text-[9px] font-bold text-[#334155] mt-0.5 leading-none">
          {remainingMs <= 0 ? '복용' : formatRemaining(remainingMs)}
        </span>
      </div>
    </div>
  )
}

function AlarmCard({
  alarm,
  onTaken,
  onDelete,
}: {
  alarm: MedicationAlarmWithChild
  onTaken: () => void
  onDelete?: () => void
}) {
  const [remainingMs, setRemainingMs] = useState(0)
  const [justTaken, setJustTaken] = useState(false)

  useEffect(() => {
    const tick = () => {
      const last = getLastTakenAt(alarm.childId, alarm.id)
      setRemainingMs(getRemainingMs(alarm.intervalHour, last))
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [alarm.childId, alarm.id, alarm.intervalHour, justTaken])

  const handleCheck = () => {
    if (remainingMs > 0) return
    markMedicationTaken(alarm.childId, alarm.id)
    setJustTaken(true)
    onTaken()
    setTimeout(() => setJustTaken(false), 1500)
  }

  const isDue = remainingMs <= 0
  const canCheck = isDue || justTaken
  const childColor = getChildColor(alarm.childId)

  return (
    <div className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${isDue
      ? 'bg-[#FFF7ED] border-[#FDBA74]'
      : 'bg-white border-[rgba(82,183,136,0.15)]'
      }`}>
      <CountdownRing remainingMs={remainingMs} intervalHour={alarm.intervalHour} />

      <div className="flex-1 min-w-0">
        <div className="text-[14px] font-bold text-[#334155] truncate">{alarm.medicineName}</div>
        <div className="text-[12px] text-[#64748B] mt-0.5">{alarm.dosage} · {alarm.intervalHour}시간 간격</div>
        <div className="text-[11px] mt-0.5">
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-bold"
            style={{ backgroundColor: childColor.bg, color: childColor.text }}
          >
            {alarm.childName}
          </span>
        </div>
      </div>

      <div className="flex flex-col items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={handleCheck}
          disabled={!canCheck}
          aria-label="복용 완료"
          className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all ${!canCheck
            ? 'border-[#CBD5E1] text-[#CBD5E1] cursor-not-allowed opacity-50'
            : justTaken
              ? 'bg-[#52B788] border-[#52B788] text-white active:scale-95'
              : 'border-[#52B788] text-[#52B788] hover:bg-[rgba(82,183,136,0.1)] active:scale-95'
            }`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </button>
        {onDelete && (
          <button type="button" onClick={onDelete} className="text-[10px] text-[#94A3B8] hover:text-[#EF4444]">
            삭제
          </button>
        )}
      </div>
    </div>
  )
}

export function MedicationAlarmPanel({ alarms, onAdd, onDelete }: Props) {
  const activeAlarms = alarms.filter((a) => a.isActive)

  return (
    <div className="mb-4 bg-white rounded-2xl border border-[rgba(82,183,136,0.15)] shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(82,183,136,0.08)]">
        <div>
          <h2 className="text-[14px] font-bold text-[#334155]">복약 알림</h2>
          <p className="text-[11px] text-[#94A3B8]">다음 복용까지 남은 시간</p>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[rgba(82,183,136,0.1)] text-[#52B788] text-[12px] font-semibold hover:bg-[rgba(82,183,136,0.18)] transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          추가
        </button>
      </div>

      <div className="p-3 space-y-2 max-h-[220px] overflow-y-auto">
        {activeAlarms.length === 0 ? (
          <p className="text-center text-[13px] text-[#94A3B8] py-4">등록된 복약 알림이 없습니다</p>
        ) : (
          activeAlarms.map((alarm) => (
            <AlarmCard
              key={`${alarm.childId}-${alarm.id}`}
              alarm={alarm}
              onTaken={() => {}}
              onDelete={onDelete ? () => onDelete(alarm.childId, alarm.id) : undefined}
            />
          ))
        )}
      </div>
    </div>
  )
}
