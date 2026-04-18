'use client'
// src/components/calendar/CalendarPage.tsx
// ✅ 메인 캘린더 페이지 - 모든 뷰를 조율합니다
import { useState, useEffect } from 'react'
import { CalendarGrid } from './CalendarGrid'
import { DayPopup } from './DayPopup'
import { ClinicForm } from './ClinicForm'
import { MedForm } from './MedForm'
import { useCalendarStore } from './store'
import { ClinicRecord, MedRecord, Child, DayEvents, CalendarEvent } from './types'
import { dateKey, calcAge } from './utils'
import { BottomNav } from '@/components/layout/BottomNav'

type View = 'calendar' | 'day' | 'clinic-form' | 'med-form' | 'success'

// 샘플 아이들 주석 처리 또는 제거
// const SAMPLE_CHILDREN: Child[] = ...

interface Props {
  initialChildren?: Child[]
}

export function CalendarPage({ initialChildren }: Props) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [view, setView] = useState<View>('calendar')
  const [successMsg, setSuccessMsg] = useState({ title: '', sub: '' })
  const [children, setChildren] = useState<Child[]>(initialChildren || [])
  const [loading, setLoading] = useState(!initialChildren)

  const { events, addEvent, removeEvent, getEventsForDate, setEvents } = useCalendarStore()

  // 1. 아이 목록 및 건강 기록 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        const { getChildren, getHealthLogs } = await import('@/lib/api')
        const childrenData = await getChildren()

        const mappedChildren: Child[] = childrenData.map(c => ({
          id: String(c.id),
          name: c.name,
          age: c.birthdate ? calcAge(c.birthdate) : 'N/A',
          gender: c.gender
        }))
        setChildren(mappedChildren)

        // 아이가 있으면 첫 번째 아이의 기록 로드 (또는 전체)
        if (mappedChildren.length > 0) {
          const logs = await getHealthLogs(Number(mappedChildren[0].id))

          const newEvents: DayEvents = {}
          logs.forEach(log => {
            const dateObj = new Date(log.eventDate)
            const key = dateKey(dateObj)

            const event: CalendarEvent = log.logType === 'MEDICATION' ? {
              id: String(log.id),
              type: 'med',
              childId: String(log.childId),
              childName: mappedChildren.find(c => c.id === String(log.childId))?.name || '',
              medName: log.content,
              startDate: log.eventDate,
              endDate: log.eventDate,
              times: [],
              dosage: '',
              alarmEnabled: false,
              date: key,
              createdAt: log.eventDate
            } : {
              id: String(log.id),
              type: 'clinic',
              childId: String(log.childId),
              childName: mappedChildren.find(c => c.id === String(log.childId))?.name || '',
              hospital: log.logType === 'HOSPITAL' ? log.content : '상담 기록',
              diagnosis: log.logType === 'CONSULTATION' ? log.content : '',
              hasNextVisit: false,
              medications: [],
              date: key,
              createdAt: log.eventDate
            }

            if (!newEvents[key]) newEvents[key] = []
            newEvents[key].push(event)
          })
          setEvents(newEvents)
        }
      } catch (err) {
        console.error('Failed to load calendar data', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [setEvents])

  const handleDayClick = (date: Date) => {
    setSelectedDate(date)
    setView('day')
  }

  const handlePrevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }

  const handleNextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  const handleSaveClinic = (record: ClinicRecord) => {
    addEvent(record)
    setSuccessMsg({
      title: '내원 기록이 저장되었습니다!',
      sub: `${record.hospital} · ${record.diagnosis}`,
    })
    setView('success')
  }

  const handleSaveMed = (record: MedRecord) => {
    addEvent(record)
    setSuccessMsg({
      title: '복약 기록이 저장되었습니다!',
      sub: `${record.medName}${record.alarmEnabled ? ' · 알림 설정됨' : ''}`,
    })
    setView('success')
  }

  const handleRemoveEvent = (id: string) => {
    if (selectedDate) removeEvent(selectedDate, id)
  }

  const dayEvents = selectedDate ? getEventsForDate(selectedDate) : []

  return (
    <div className="flex flex-col h-dvh max-w-[430px] mx-auto bg-[#F4FCFB] overflow-hidden">

      {/* ── 캘린더 뷰 ── */}
      {view === 'calendar' && (
        <div className="flex-1 overflow-y-auto px-5 pt-6 pb-6 mt-2">
          <h1 className="text-[24px] font-black tracking-tight text-[#334155] mb-5">
            캘린더
          </h1>
          <CalendarGrid
            year={year}
            month={month}
            events={events}
            onDayClick={handleDayClick}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
          />
        </div>
      )}

      {/* ── 하루 이벤트 뷰 ── */}
      {view === 'day' && selectedDate && (
        <div className="flex flex-col h-full">
          {/* Back to calendar */}
          <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-[rgba(82,183,136,0.12)] flex-shrink-0">
            <button
              onClick={() => setView('calendar')}
              className="w-8 h-8 rounded-full border border-[rgba(82,183,136,0.2)] flex items-center justify-center text-[#475569] hover:bg-[rgba(82,183,136,0.08)]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <h2 className="text-[15px] font-semibold text-[#334155]">
              {year}년 {month + 1}월
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <DayPopup
              date={selectedDate}
              events={dayEvents}
              onClose={() => setView('calendar')}
              onAddClinic={() => setView('clinic-form')}
              onAddMed={() => setView('med-form')}
              onRemove={handleRemoveEvent}
            />
          </div>
        </div>
      )}

      {/* ── 내원 기록 폼 ── */}
      {view === 'clinic-form' && selectedDate && (
        <ClinicForm
          date={selectedDate}
          children={children}
          onSave={handleSaveClinic}
          onBack={() => setView('day')}
        />
      )}

      {/* ── 복약 기록 폼 ── */}
      {view === 'med-form' && selectedDate && (
        <MedForm
          date={selectedDate}
          children={children}
          onSave={handleSaveMed}
          onBack={() => setView('day')}
        />
      )}

      {/* ── 저장 완료 ── */}
      {view === 'success' && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="w-16 h-16 rounded-full bg-[#EAFBF1] flex items-center justify-center mb-5">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#27500A" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 className="text-[18px] font-semibold text-[#334155] mb-2">{successMsg.title}</h2>
          <p className="text-[14px] text-[#475569] mb-8">{successMsg.sub}</p>
          <div className="flex gap-3 w-full max-w-[280px]">
            <button
              onClick={() => { setView('day') }}
              className="flex-1 py-3 rounded-xl border border-[rgba(82,183,136,0.2)] text-[14px] font-medium text-[#52B788] hover:bg-[rgba(82,183,136,0.08)] transition-colors">
              날짜로
            </button>
            <button
              onClick={() => setView('calendar')}
              className="flex-1 py-3 rounded-xl bg-[#52B788] text-white text-[14px] font-medium active:opacity-85 transition-opacity">
              달력으로
            </button>
          </div>
        </div>
      )}
      <BottomNav />
    </div>
  )
}
