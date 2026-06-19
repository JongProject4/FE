'use client'
// src/components/calendar/WeeklyView.tsx
import { useMemo } from 'react'
import type { CalendarEvent, ClinicRecord, ConsultationRecord } from './types'
import { EventDots } from './EventDots'
import { dateKey, isToday, formatVisitTimeLabel } from './utils'
import { getChildColor } from '@/lib/childColors'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

interface Props {
    year: number
    month: number
    events: { [key: string]: CalendarEvent[] }
    onDayClick: (date: Date) => void
    onPrevWeek: () => void
    onNextWeek: () => void
    weekOffset: number
}

function formatVisitTime(visitDate: string): string {
    return formatVisitTimeLabel(visitDate)
}

export function WeeklyView({ events, onDayClick, onPrevWeek, onNextWeek, weekOffset }: Props) {
    const weekDays = useMemo(() => {
        const today = new Date()
        const dayOfWeek = today.getDay()
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

    const weekSchedule = weekDays.flatMap((date) => {
        const key = dateKey(date)
        return (events[key] || [])
            .filter((ev) => ev.type === 'consultation' || ev.type === 'clinic')
            .map((ev) => ({ date, ev }))
    })

    return (
        <div className="flex flex-col bg-white rounded-3xl shadow-xl overflow-hidden pb-4">
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
                {weekDays.map((date, idx) => {
                    const key = dateKey(date)
                    const dayEvents = events[key] || []
                    const consultations = dayEvents.filter((e) => e.type === 'consultation')
                    const clinics = dayEvents.filter((e) => e.type === 'clinic')
                    const todayFlag = isToday(date)
                    const dow = date.getDay()

                    return (
                        <button
                            key={idx}
                            onClick={() => onDayClick(date)}
                            className="min-h-[56px] rounded-[8px] p-1 flex flex-col items-center justify-start pt-1 hover:bg-[rgba(82,183,136,0.08)] active:scale-95 cursor-pointer transition-colors"
                        >
                            <div
                                className={`w-7 h-7 flex items-center justify-center text-[13px] leading-none shrink-0 ${todayFlag
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

                            <EventDots
                                consultationChildIds={consultations.map((e) => e.childId || e.childName)}
                                clinicCount={clinics.length}
                            />
                        </button>
                    )
                })}
            </div>

            <div className="px-4 pt-2 border-t border-[rgba(82,183,136,0.08)]">
                <p className="text-[11px] font-semibold text-[#94A3B8] mb-2">이번 주 일정</p>
                {weekSchedule.length === 0 ? (
                    <p className="text-[12px] text-[#CBD5E1] text-center py-3">이번 주 등록된 일정이 없습니다</p>
                ) : (
                    <div className="flex flex-col gap-2">
                        {weekSchedule.map(({ date, ev }, idx) => {
                            const clinic = ev.type === 'clinic' ? (ev as ClinicRecord) : null
                            const consultation = ev.type === 'consultation' ? (ev as ConsultationRecord) : null
                            const typeLabel = consultation
                                ? (consultation.isVoice ? '음성 상담' : '텍스트 상담')
                                : '내원'
                            const consultationTitle = consultation
                                ? consultation.title.replace(/^🎙\s*/, '').trim()
                                : ''
                            return (
                                <div
                                    key={idx}
                                    className={`flex items-center gap-3 p-2 rounded-xl ${ev.type === 'consultation'
                                        ? 'border-l-[3px]'
                                        : 'bg-[rgba(226,75,74,0.08)] border-l-[3px] border-[#E24B4A]'
                                        }`}
                                    style={ev.type === 'consultation'
                                        ? {
                                            backgroundColor: getChildColor(ev.childId || ev.childName).bg,
                                            borderLeftColor: getChildColor(ev.childId || ev.childName).border,
                                        }
                                        : undefined}
                                >
                                    <div className="flex flex-col items-center min-w-[28px]">
                                        <span className="text-[10px] font-semibold text-[#94A3B8]">{WEEKDAYS[date.getDay()]}</span>
                                        <span className="text-[13px] font-bold text-[#334155]">{date.getDate()}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[12px] font-semibold text-[#334155] truncate">
                                            {consultation ? typeLabel : clinic?.hospitalName}
                                        </p>
                                        <p className="text-[11px] text-[#64748B] truncate">
                                            {consultation
                                                ? `${consultation.isVoice ? '🎙' : '💬'} ${consultationTitle || consultation.childName}`
                                                : `🏥 ${formatVisitTime(clinic?.visitDate || '')} · ${ev.childName}`}
                                        </p>
                                    </div>
                                    <span className={`text-[10px] px-2 py-[2px] rounded-full font-medium ${ev.type === 'consultation'
                                        ? 'text-white'
                                        : 'bg-[#E24B4A] text-white'
                                        }`}
                                        style={ev.type === 'consultation'
                                            ? { backgroundColor: getChildColor(ev.childId || ev.childName).dot }
                                            : undefined}
                                    >
                                        {consultation ? (consultation.isVoice ? '음성' : '텍스트') : '내원'}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
