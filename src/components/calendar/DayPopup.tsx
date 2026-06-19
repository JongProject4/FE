'use client'
// src/components/calendar/DayPopup.tsx
import { useRouter } from 'next/navigation'
import { CalendarEvent, ClinicRecord, ConsultationRecord } from './types'
import { formatDateLabel, formatVisitTimeLabel } from './utils'
import { getCategoryLabel, getRiskLabel } from '@/lib/chatLabels'
import { getChildColor } from '@/lib/childColors'
import { useAppStore } from '@/lib/store'

interface Props {
  date: Date
  events: CalendarEvent[]
  onClose: () => void
  onAddClinic: () => void
  onRemove: (id: string) => void
}


function consultationTypeLabel(isVoice?: boolean): string {
  return isVoice ? '음성 상담' : '텍스트 상담'
}

function consultationDisplayTitle(title: string): string {
  return title.replace(/^🎙\s*/, '').trim()
}

function ConsultationItem({ event }: { event: ConsultationRecord }) {
  const router = useRouter()
  const { setConsultationId, setMessages } = useAppStore()
  const childColor = getChildColor(event.childId || event.childName)
  const typeLabel = consultationTypeLabel(event.isVoice)

  const openChat = () => {
    setConsultationId(String(event.chatId))
    setMessages([])
    router.push('/chat')
  }

  return (
    <button
      type="button"
      onClick={openChat}
      className="flex items-start gap-3 py-3 w-full text-left hover:bg-[rgba(139,92,246,0.04)] rounded-xl px-1 -mx-1 transition-colors"
    >
      <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: childColor.dot }} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          {event.isVoice ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={childColor.dot} strokeWidth="2" className="shrink-0">
              <rect x="9" y="2" width="6" height="12" rx="3" />
              <path d="M5 10c0 4 3 7 7 7s7-3 7-7" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={childColor.dot} strokeWidth="2" className="shrink-0">
              <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
            </svg>
          )}
          <span className="text-[14px] font-semibold text-[#334155] truncate">{typeLabel}</span>
          <span
            className="px-2 py-0.5 text-[10px] font-semibold rounded-full flex-shrink-0"
            style={{ backgroundColor: childColor.bg, color: childColor.text }}
          >
            {event.childName}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 mb-1">
          <span className="rounded-full bg-[#F1F5F9] px-2 py-0.5 text-[10px] font-semibold text-[#94A3B8]">
            {getCategoryLabel(event.category)}
          </span>
          <span className="rounded-full bg-[#F1F5F9] px-2 py-0.5 text-[10px] font-semibold text-[#94A3B8]">
            {getRiskLabel(event.riskLevel)}
          </span>
        </div>
        <div className="text-[12px] text-[#94A3B8] truncate">{consultationDisplayTitle(event.title)}</div>
      </div>
    </button>
  )
}

function ClinicItem({ event, onRemove }: { event: ClinicRecord; onRemove: (id: string) => void }) {
  return (
    <div className="flex items-start gap-3 py-3">
      <div className="w-2 h-2 rounded-full bg-[#E24B4A] mt-1.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-[14px] font-medium text-[#334155] truncate">{event.hospitalName}</span>
          <span className="px-2 py-0.5 bg-[rgba(226,75,74,0.12)] text-[#E24B4A] text-[10px] font-semibold rounded-full flex-shrink-0">내원</span>
        </div>
        <div className="text-[12px] text-[#475569]">{formatVisitTimeLabel(event.visitDate)}</div>
        {event.memo && <div className="text-[12px] text-[#64748B] mt-0.5 truncate">{event.memo}</div>}
        <div className="text-[11px] text-[#94A3B8] mt-0.5">{event.childName}</div>
      </div>
      <button
        type="button"
        onClick={() => onRemove(event.id)}
        className="text-[11px] text-[#94A3B8] hover:text-[#EF4444] shrink-0 pt-1"
      >
        삭제
      </button>
    </div>
  )
}

export function DayPopup({ date, events, onClose, onAddClinic, onRemove }: Props) {
  const consultations = events.filter((e): e is ConsultationRecord => e.type === 'consultation')
  const clinics = events.filter((e): e is ClinicRecord => e.type === 'clinic')

  return (
    <div className="bg-white rounded-3xl shadow-2xl border border-[rgba(82,183,136,0.15)] overflow-hidden w-full max-w-[390px]">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(82,183,136,0.1)]">
        <h3 className="text-[15px] font-semibold text-[#334155]">{formatDateLabel(date)}</h3>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-full bg-[#F4FCFB] flex items-center justify-center text-[#475569] hover:bg-[rgba(82,183,136,0.08)] transition-colors border border-[rgba(82,183,136,0.15)]"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="px-4 divide-y divide-[rgba(82,183,136,0.08)] max-h-[50vh] overflow-y-auto">
        {events.length === 0 ? (
          <div className="py-6 text-center">
            <div className="text-[13px] text-[#94A3B8]">이 날 기록이 없습니다</div>
          </div>
        ) : (
          <>
            {consultations.map((event) => (
              <ConsultationItem key={event.id} event={event} />
            ))}
            {clinics.map((event) => (
              <ClinicItem key={event.id} event={event} onRemove={onRemove} />
            ))}
          </>
        )}
      </div>

      <div className="px-4 py-3 border-t border-[rgba(82,183,136,0.1)]">
        <button
          onClick={onAddClinic}
          className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-dashed border-[rgba(82,183,136,0.3)] text-[12px] font-medium text-[#475569] hover:bg-[rgba(82,183,136,0.05)] hover:text-[#52B788] hover:border-[#52B788] transition-all"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          내원 알림 추가
        </button>
      </div>
    </div>
  )
}
