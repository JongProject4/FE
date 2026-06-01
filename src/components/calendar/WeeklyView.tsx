'use client'
// src/components/calendar/WeeklyView.tsx
import { useMemo } from 'react'
import { CalendarEvent } from './types'
import { dateKey, isToday } from './utils'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

interface Props {
    year: number
    month: number
    events: { [key: string]: CalendarEvent[] }
    onDayClick: (date: Date) => void
    onPrevWeek: () => void
    onNextWeek: () => void
    weekOffset: number // 0 = current week, ±1, ±2 ...
}

export function WeeklyView({ year, month, events, onDayClick, onPrevWeek, onNextWeek, weekOffset }: Props) {
    const weekDays = useMemo(() => {
        const today = new Date()
        const dayOfWeek = today.getDay() // 0=Sun
        const sunday = new Date(today)
        sunday.setDate(today.getDate() - dayOfWeek + weekOffset * 7)

        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date(sunday)
            d.setDate(sunday.getDate() + i)
            return d
        })
    }, [weekOffset])

    const startDay = weekDays[0]
    const endDay = weekDays[6]

    const formatRange = () => {
        const sy = startDay.getFullYear()
        const sm = startDay.getMonth() + 1
        const sd = startDay.getDate()
        const em = endDay.getMonth() + 1
        const ed = endDay.getDate()
        if (sm === em) return `${sy}년 ${sm}월 ${sd}일 - ${ed}일`
        return `${sy}년 ${sm}월 ${sd}일 - ${em}월 ${ed}일`
    }

    return (
        <div className="flex flex-col bg-white rounded-3xl shadow-xl overflow-hidden pb-4">
            {/* Header nav */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(82,183,136,0.12)]">
                <button
                    onClick={onPrevWeek}
                    className="w-8 h-8 rounded-full border border-[rgba(82,183,136,0.2)] flex items-center justify-center text-[#475569] hover:bg-[rgba(82,183,136,0.08)] active:scale-95 transition-all"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M15 18l-6-6 6-6" />
                    </svg>
                </button>
                <h2 className="text-[14px] font-semibold text-[#334155]">{formatRange()}</h2>
                <button
                    onClick={onNextWeek}
                    className="w-8 h-8 rounded-full border border-[rgba(82,183,136,0.2)] flex items-center justify-center text-[#475569] hover:bg-[rgba(82,183,136,0.08)] active:scale-95 transition-all"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M9 18l6-6-6-6" />
                    </svg>
                </button>
            </div>

            {/* Weekday headers */}
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

            {/* Day cells (1 row, 7 cols) */}
            <div className="grid grid-cols-7 gap-[2px] px-3 pb-3">
                {weekDays.map((date, idx) => {
                    const key = dateKey(date)
                    const dayEvents = events[key] || []
                    const hasClinic = dayEvents.some(e => e.type === 'clinic')
                    const hasMed = dayEvents.some(e => e.type === 'med')
                    const todayFlag = isToday(date)
                    const dow = date.getDay()

                    return (
                        <button
                            key={idx}
                            onClick={() => onDayClick(date)}
                            className="min-h-[60px] rounded-[8px] p-1 flex flex-col items-center hover:bg-[rgba(82,183,136,0.08)] active:scale-95 cursor-pointer transition-colors"
                        >
                            <div
                                className={`w-7 h-7 flex items-center justify-center text-[13px] leading-none mb-1 ${todayFlag
                                    ? 'rounded-full bg-[#52B788] text-white font-semibold'
                                    : dow === 0
                                        ? 'text-[#E24B4A]'
                                        : dow === 6
                                            ? 'text-[#4A90D9]'
                                            : 'text-[#334155]'
                                    }`}
                            >
                                {date.getDate()}
                            </div>
                            {/* Event dots */}
                            <div className="flex gap-[3px]">
                                {hasClinic && <div className="w-[5px] h-[5px] rounded-full bg-[#E24B4A]" />}
                                {hasMed && <div className="w-[5px] h-[5px] rounded-full bg-[#52B788]" />}
                            </div>
                            {/* Mini event label */}
                            {dayEvents.length > 0 && (
                                <div className="mt-1 w-full flex flex-col gap-[2px] items-center">
                                    {dayEvents.slice(0, 1).map((ev, evIdx) => (
                                        <span
                                            key={evIdx}
                                            className={`text-[8px] px-1 py-[1px] rounded-full leading-tight text-white truncate max-w-full ${ev.type === 'clinic' ? 'bg-[#E24B4A]' : 'bg-[#52B788]'
                                                }`}
                                        >
                                            {ev.type === 'clinic' ? (ev as any).hospital : (ev as any).medName}
                                        </span>
                                    ))}
                                    {dayEvents.length > 1 && (
                                        <span className="text-[8px] text-[#94A3B8]">+{dayEvents.length - 1}</span>
                                    )}
                                </div>
                            )}
                        </button>
                    )
                })}
            </div>

            {/* Weekly schedule list */}
            <div className="px-4 pt-2 border-t border-[rgba(82,183,136,0.08)]">
                <p className="text-[11px] font-semibold text-[#94A3B8] mb-2">이번 주 일정</p>
                {weekDays.flatMap(date => {
                    const key = dateKey(date)
                    return (events[key] || []).map(ev => ({ date, ev }))
                }).length === 0 ? (
                    <p className="text-[12px] text-[#CBD5E1] text-center py-3">이번 주 등록된 일정이 없습니다</p>
                ) : (
                    <div className="flex flex-col gap-2">
                        {weekDays.flatMap(date => {
                            const key = dateKey(date)
                            return (events[key] || []).map(ev => ({ date, ev }))
                        }).map(({ date, ev }, idx) => (
                            <div
                                key={idx}
                                className={`flex items-center gap-3 p-2 rounded-xl ${ev.type === 'clinic'
                                    ? 'bg-[rgba(226,75,74,0.08)] border-l-[3px] border-[#E24B4A]'
                                    : 'bg-[rgba(82,183,136,0.08)] border-l-[3px] border-[#52B788]'
                                    }`}
                            >
                                <div className="flex flex-col items-center min-w-[28px]">
                                    <span className="text-[10px] font-semibold text-[#94A3B8]">{WEEKDAYS[date.getDay()]}</span>
                                    <span className="text-[13px] font-bold text-[#334155]">{date.getDate()}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[12px] font-semibold text-[#334155] truncate">
                                        {ev.type === 'clinic' ? (ev as any).hospital : (ev as any).medName}
                                    </p>
                                    <p className="text-[11px] text-[#64748B] truncate">
                                        {ev.type === 'clinic' ? '🏥 내원 기록' : '💊 복약 기록'}
                                        {ev.type === 'clinic' && (ev as any).diagnosis ? ` · ${(ev as any).diagnosis}` : ''}
                                    </p>
                                </div>
                                <span className={`text-[10px] px-2 py-[2px] rounded-full font-medium ${ev.type === 'clinic'
                                    ? 'bg-[#E24B4A] text-white'
                                    : 'bg-[#52B788] text-white'
                                    }`}>
                                    {ev.type === 'clinic' ? '내원' : '복약'}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
