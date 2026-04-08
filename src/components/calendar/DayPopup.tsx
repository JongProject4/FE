'use client'
// src/components/calendar/DayPopup.tsx
import { CalendarEvent, ClinicRecord, MedRecord } from './types'
import { formatDateLabel } from './utils'

interface Props {
  date: Date
  events: CalendarEvent[]
  onClose: () => void
  onAddClinic: () => void
  onAddMed: () => void
  onRemove: (id: string) => void
}

function ClinicItem({ event }: { event: ClinicRecord }) {
  return (
    <div className="flex items-start gap-3 py-3">
      <div className="w-2 h-2 rounded-full bg-[#52B788] mt-1.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-[14px] font-medium text-[#334155] truncate">{event.hospital}</span>
          <span className="px-2 py-0.5 bg-[rgba(82,183,136,0.12)] text-[#52B788] text-[10px] font-semibold rounded-full flex-shrink-0">내원</span>
        </div>
        <div className="text-[12px] text-[#475569]">{event.diagnosis}</div>
        {event.hasNextVisit && event.nextVisitDate && (
          <div className="text-[11px] text-[#94A3B8] mt-0.5">
            다음 내원: {event.nextVisitDate}
          </div>
        )}
        {event.medications.length > 0 && (
          <div className="text-[11px] text-[#52B788] mt-0.5">
            복약: {event.medications.map(m => m.name).join(', ')}
          </div>
        )}
      </div>
    </div>
  )
}

function MedItem({ event }: { event: MedRecord }) {
  return (
    <div className="flex items-start gap-3 py-3">
      <div className="w-2 h-2 rounded-full bg-[#6EE7B7] mt-1.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-[14px] font-medium text-[#334155] truncate">{event.medName}</span>
          <span className="px-2 py-0.5 bg-[#F4FCFB] text-[#40916C] text-[10px] font-semibold rounded-full flex-shrink-0 border border-[rgba(82,183,136,0.12)]">복약</span>
        </div>
        <div className="text-[12px] text-[#475569]">
          {event.startDate} ~ {event.endDate}
        </div>
        {event.times.length > 0 && (
          <div className="text-[11px] text-[#94A3B8] mt-0.5">
            복용 시간: {event.times.join(', ')}
          </div>
        )}
        {event.alarmEnabled && (
          <div className="text-[11px] text-[#52B788] mt-0.5">알림 설정됨</div>
        )}
      </div>
    </div>
  )
}

export function DayPopup({ date, events, onClose, onAddClinic, onAddMed, onRemove }: Props) {
  return (
    <div className="bg-white rounded-3xl shadow-xl border border-[rgba(82,183,136,0.15)] overflow-hidden mb-4">
      {/* Header */}
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

      {/* Event list */}
      <div className="px-4 divide-y divide-[rgba(82,183,136,0.08)]">
        {events.length === 0 ? (
          <div className="py-6 text-center">
            <div className="text-[13px] text-[#94A3B8]">이 날 기록이 없습니다</div>
          </div>
        ) : (
          events.map((event) =>
            event.type === 'clinic'
              ? <ClinicItem key={event.id} event={event as ClinicRecord} />
              : <MedItem key={event.id} event={event as MedRecord} />
          )
        )}
      </div>

      {/* Add buttons */}
      <div className="flex gap-2 px-4 py-3 border-t border-[rgba(82,183,136,0.1)]">
        <button
          onClick={onAddClinic}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-dashed border-[rgba(82,183,136,0.3)] text-[12px] font-medium text-[#475569] hover:bg-[rgba(82,183,136,0.05)] hover:text-[#52B788] hover:border-[#52B788] transition-all"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          내원 기록
        </button>
        <button
          onClick={onAddMed}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-dashed border-[rgba(82,183,136,0.3)] text-[12px] font-medium text-[#475569] hover:bg-[rgba(82,183,136,0.05)] hover:text-[#52B788] hover:border-[#52B788] transition-all"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          복약 기록
        </button>
      </div>
    </div>
  )
}
