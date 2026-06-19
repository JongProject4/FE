'use client'
// src/components/calendar/CalendarGrid.tsx
import { useMemo } from 'react'
import { CalendarEvent } from './types'
import { dateKey, isToday, getDaysInMonth, getFirstDayOfWeek } from './utils'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

interface DayCell {
  date: Date
  isCurrentMonth: boolean
}

interface Props {
  year: number
  month: number
  events: { [key: string]: CalendarEvent[] }
  onDayClick: (date: Date) => void
  onPrevMonth: () => void
  onNextMonth: () => void
}

export function CalendarGrid({ year, month, events, onDayClick, onPrevMonth, onNextMonth }: Props) {
  const cells = useMemo<DayCell[]>(() => {
    const result: DayCell[] = []
    const firstDay = getFirstDayOfWeek(year, month)
    const daysInMonth = getDaysInMonth(year, month)
    const prevMonthDays = getDaysInMonth(year, month - 1)

    for (let i = 0; i < firstDay; i++) {
      result.push({
        date: new Date(year, month - 1, prevMonthDays - firstDay + 1 + i),
        isCurrentMonth: false,
      })
    }
    for (let d = 1; d <= daysInMonth; d++) {
      result.push({ date: new Date(year, month, d), isCurrentMonth: true })
    }
    const remaining = 42 - result.length
    const actualRemaining = remaining > 7 ? remaining - 7 : remaining
    for (let d = 1; d <= actualRemaining; d++) {
      result.push({ date: new Date(year, month + 1, d), isCurrentMonth: false })
    }
    return result
  }, [year, month])

  return (
    <div className="flex flex-col bg-white rounded-3xl shadow-xl overflow-hidden pb-4">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(82,183,136,0.12)]">
        <button
          onClick={onPrevMonth}
          className="w-8 h-8 rounded-full border border-[rgba(82,183,136,0.2)] flex items-center justify-center text-[#475569] hover:bg-[rgba(82,183,136,0.08)] active:scale-95 transition-all"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <h2 className="text-[16px] font-semibold text-[#334155]">
          {year}년 {month + 1}월
        </h2>
        <button
          onClick={onNextMonth}
          className="w-8 h-8 rounded-full border border-[rgba(82,183,136,0.2)] flex items-center justify-center text-[#475569] hover:bg-[rgba(82,183,136,0.08)] active:scale-95 transition-all"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-7 px-3 pt-2 pb-1">
        {WEEKDAYS.map((day, i) => (
          <div
            key={day}
            className={`text-center text-[11px] font-semibold py-1 ${i === 0 ? 'text-[#E24B4A]' : i === 6 ? 'text-[#4A90D9]' : 'text-[#94A3B8]'
              }`}
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-[2px] px-3 pb-3">
        {cells.map((cell, idx) => {
          const key = dateKey(cell.date)
          const dayEvents = events[key] || []
          const consultations = dayEvents.filter(e => e.type === 'consultation')
          const hasClinic = dayEvents.some(e => e.type === 'clinic')
          const hasMed = dayEvents.some(e => e.type === 'med')
          const today = isToday(cell.date)
          const dow = cell.date.getDay()

          return (
            <button
              key={idx}
              onClick={() => cell.isCurrentMonth && onDayClick(cell.date)}
              className={`min-h-[76px] rounded-[8px] p-1 flex flex-col items-center justify-start pt-1 transition-colors relative ${cell.isCurrentMonth
                ? 'hover:bg-[rgba(82,183,136,0.08)] hover:shadow-sm active:scale-95 cursor-pointer'
                : 'cursor-default opacity-30'
                }`}
            >
              {/* Date — top */}
              <div
                className={`w-7 h-7 flex items-center justify-center text-[13px] leading-none shrink-0 ${today
                  ? 'rounded-full bg-[#52B788] text-white font-semibold shadow-md'
                  : dow === 0
                    ? 'text-[#E24B4A] font-medium'
                    : dow === 6
                      ? 'text-[#4A90D9] font-medium'
                      : 'text-[#334155] font-medium'
                  }`}
              >
                {cell.date.getDate()}
              </div>

              {/* Consultation badge */}
              {consultations.length > 0 && cell.isCurrentMonth && (
                <div className="mt-1 flex flex-col items-center gap-[2px] w-full px-0.5">
                  <span className="inline-flex items-center gap-0.5 text-[8px] font-bold px-1.5 py-[2px] rounded-md leading-tight text-white bg-[#8B5CF6] shadow-sm max-w-full">
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0">
                      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
                    </svg>
                    상담
                  </span>
                  {consultations.length > 1 && (
                    <span className="text-[7px] font-bold text-[#94A3B8]">+{consultations.length - 1}</span>
                  )}
                  <div className="w-[5px] h-[5px] rounded-full bg-[#8B5CF6] shadow-sm" />
                </div>
              )}

              {/* Clinic / med indicators */}
              {(hasClinic || hasMed) && cell.isCurrentMonth && (
                <div className="mt-auto pt-1 flex flex-col items-center gap-[2px] w-full">
                  {dayEvents.filter(e => e.type !== 'consultation').slice(0, 1).map((ev, evIdx) => (
                    <span
                      key={evIdx}
                      className={`text-[8px] font-bold px-[4px] py-[2px] rounded-sm leading-tight text-white truncate max-w-[90%] shadow-sm ${ev.type === 'clinic' ? 'bg-[#E24B4A]' : 'bg-[#52B788]'
                        }`}
                    >
                      {ev.type === 'clinic'
                        ? (ev as { hospital: string }).hospital
                        : (ev as { medName: string }).medName}
                    </span>
                  ))}
                  <div className="flex gap-[3px]">
                    {hasClinic && <div className="w-[5px] h-[5px] rounded-full bg-[#E24B4A] shadow-sm" />}
                    {hasMed && <div className="w-[5px] h-[5px] rounded-full bg-[#52B788] shadow-sm" />}
                  </div>
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
