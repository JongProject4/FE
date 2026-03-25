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

    // Previous month filler
    for (let i = 0; i < firstDay; i++) {
      result.push({
        date: new Date(year, month - 1, prevMonthDays - firstDay + 1 + i),
        isCurrentMonth: false,
      })
    }
    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
      result.push({ date: new Date(year, month, d), isCurrentMonth: true })
    }
    // Next month filler
    const remaining = 42 - result.length
    const actualRemaining = remaining > 7 ? remaining - 7 : remaining
    for (let d = 1; d <= actualRemaining; d++) {
      result.push({ date: new Date(year, month + 1, d), isCurrentMonth: false })
    }
    return result
  }, [year, month])

  return (
    <div className="flex flex-col bg-white">
      {/* Month navigation */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(74,144,217,0.12)]">
        <button
          onClick={onPrevMonth}
          className="w-8 h-8 rounded-full border border-[rgba(74,144,217,0.2)] flex items-center justify-center text-[#6B7A99] hover:bg-[#EBF4FF] active:scale-95 transition-all"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
        <h2 className="text-[16px] font-semibold text-[#1A2340]">
          {year}년 {month + 1}월
        </h2>
        <button
          onClick={onNextMonth}
          className="w-8 h-8 rounded-full border border-[rgba(74,144,217,0.2)] flex items-center justify-center text-[#6B7A99] hover:bg-[#EBF4FF] active:scale-95 transition-all"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 px-3 pt-2 pb-1">
        {WEEKDAYS.map((day, i) => (
          <div
            key={day}
            className={`text-center text-[11px] font-semibold py-1 ${
              i === 0 ? 'text-[#E24B4A]' : i === 6 ? 'text-[#4A90D9]' : 'text-[#A0AABF]'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-[2px] px-3 pb-3">
        {cells.map((cell, idx) => {
          const key = dateKey(cell.date)
          const dayEvents = events[key] || []
          const hasClinc = dayEvents.some(e => e.type === 'clinic')
          const hasMed = dayEvents.some(e => e.type === 'med')
          const today = isToday(cell.date)
          const dow = cell.date.getDay()

          return (
            <button
              key={idx}
              onClick={() => cell.isCurrentMonth && onDayClick(cell.date)}
              className={`min-h-[52px] rounded-[8px] p-1 flex flex-col items-center transition-colors ${
                cell.isCurrentMonth
                  ? 'hover:bg-[#EBF4FF] active:scale-95 cursor-pointer'
                  : 'cursor-default opacity-30'
              }`}
            >
              <div
                className={`w-7 h-7 flex items-center justify-center text-[13px] leading-none mb-1 ${
                  today
                    ? 'rounded-full bg-[#4A90D9] text-white font-semibold'
                    : dow === 0
                    ? 'text-[#E24B4A]'
                    : dow === 6
                    ? 'text-[#4A90D9]'
                    : 'text-[#1A2340]'
                }`}
              >
                {cell.date.getDate()}
              </div>
              {/* Event dots */}
              <div className="flex gap-[3px]">
                {hasClinc && <div className="w-[5px] h-[5px] rounded-full bg-[#4A90D9]" />}
                {hasMed && <div className="w-[5px] h-[5px] rounded-full bg-[#52B788]" />}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
