'use client'
// src/components/calendar/CalendarPage.tsx
import { useState, useEffect, useCallback } from 'react'
import { CalendarGrid } from './CalendarGrid'
import { WeeklyView } from './WeeklyView'
import { DayPopup } from './DayPopup'
import { ClinicForm, type ClinicFormSavePayload } from './ClinicForm'
import { MedForm, type MedFormSavePayload } from './MedForm'
import { MedicationAlarmPanel, type MedicationAlarmWithChild } from './MedicationAlarmPanel'
import { useCalendarStore } from './store'
import { ClinicRecord, Child } from './types'
import { calcAge } from './utils'
import { BottomNav } from '@/components/layout/BottomNav'
import {
  createHospitalAlarm,
  createMedicationAlarm,
  deleteHospitalAlarm,
  deleteMedicationAlarm,
  getChildren,
  getMedicationAlarms,
} from '@/lib/api'
import {
  fetchHospitalCalendarEvents,
  mergeHospitalEvents,
  stripMedEvents,
} from '@/lib/hospitalCalendar'
import { fetchConsultationCalendarEvents, mergeConsultationEvents } from '@/lib/chatCalendar'

type View = 'calendar' | 'clinic-form' | 'med-form' | 'success'
type CalendarMode = 'monthly' | 'weekly'

interface Props {
  initialChildren?: Child[]
}

async function loadMedicationAlarmsForChildren(childList: Child[]): Promise<MedicationAlarmWithChild[]> {
  const all: MedicationAlarmWithChild[] = []
  for (const child of childList) {
    try {
      const alarms = await getMedicationAlarms(Number(child.id))
      for (const alarm of alarms) {
        all.push({ ...alarm, childName: child.name })
      }
    } catch (e) {
      console.error(`Failed to load medication alarms for child ${child.id}`, e)
    }
  }
  return all
}

export function CalendarPage({ initialChildren }: Props) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showDayPopup, setShowDayPopup] = useState(false)
  const [view, setView] = useState<View>('calendar')
  const [successMsg, setSuccessMsg] = useState({ title: '', sub: '' })
  const [children, setChildren] = useState<Child[]>(initialChildren || [])
  const [medicationAlarms, setMedicationAlarms] = useState<MedicationAlarmWithChild[]>([])
  const [loading, setLoading] = useState(!initialChildren)
  const [saving, setSaving] = useState(false)
  const [calendarMode, setCalendarMode] = useState<CalendarMode>('monthly')
  const [weekOffset, setWeekOffset] = useState(0)

  const { events, removeEvent, getEventsForDate, setEvents } = useCalendarStore()

  const reloadCalendarEvents = useCallback(async (childList: Child[]) => {
    const [consultationEvents, hospitalEvents] = await Promise.all([
      fetchConsultationCalendarEvents(),
      fetchHospitalCalendarEvents(childList),
    ])
    setEvents((prev) =>
      mergeHospitalEvents(
        mergeConsultationEvents(stripMedEvents(prev), consultationEvents),
        hospitalEvents
      )
    )
  }, [setEvents])

  useEffect(() => {
    const loadData = async () => {
      try {
        const childrenData = await getChildren()
        const mappedChildren: Child[] = childrenData.map((c) => ({
          id: String(c.id),
          name: c.name,
          age: c.birthdate ? calcAge(c.birthdate) : 'N/A',
          gender: c.gender,
        }))
        setChildren(mappedChildren)

        if (mappedChildren.length > 0) {
          const [medAlarms] = await Promise.all([
            loadMedicationAlarmsForChildren(mappedChildren),
            reloadCalendarEvents(mappedChildren),
          ])
          setMedicationAlarms(medAlarms)
        }
      } catch (err) {
        console.error('Failed to load calendar data', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [reloadCalendarEvents])

  const handleDayClick = (date: Date) => {
    setSelectedDate(date)
    setShowDayPopup(true)
  }

  const handlePrevMonth = () => {
    if (month === 0) { setYear((y) => y - 1); setMonth(11) }
    else setMonth((m) => m - 1)
  }

  const handleNextMonth = () => {
    if (month === 11) { setYear((y) => y + 1); setMonth(0) }
    else setMonth((m) => m + 1)
  }

  const handleSaveClinic = async (payload: ClinicFormSavePayload) => {
    setSaving(true)
    try {
      await createHospitalAlarm(Number(payload.childId), payload.request)
      await reloadCalendarEvents(children)
      setSuccessMsg({
        title: '내원 알림이 저장되었습니다!',
        sub: payload.request.hospitalName,
      })
      setView('success')
    } catch (err) {
      console.error('Failed to save hospital alarm', err)
      alert('내원 알림 저장에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveMed = async (payload: MedFormSavePayload) => {
    setSaving(true)
    try {
      await createMedicationAlarm(Number(payload.childId), payload.request)
      const medAlarms = await loadMedicationAlarmsForChildren(children)
      setMedicationAlarms(medAlarms)
      setSuccessMsg({
        title: '복약 알림이 저장되었습니다!',
        sub: `${payload.request.medicineName} · ${payload.request.dosage}`,
      })
      setView('success')
    } catch (err) {
      console.error('Failed to save medication alarm', err)
      alert('복약 알림 저장에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const handleRemoveEvent = async (id: string) => {
    if (!selectedDate) return
    const event = dayEvents.find((e) => e.id === id)
    if (event?.type === 'clinic') {
      const clinic = event as ClinicRecord
      try {
        await deleteHospitalAlarm(Number(clinic.childId), clinic.alarmId)
        await reloadCalendarEvents(children)
      } catch (err) {
        console.error('Failed to delete hospital alarm', err)
        alert('삭제에 실패했습니다.')
        return
      }
    } else {
      removeEvent(selectedDate, id)
    }
  }

  const handleDeleteMedication = async (childId: number, alarmId: number) => {
    try {
      await deleteMedicationAlarm(childId, alarmId)
      const medAlarms = await loadMedicationAlarmsForChildren(children)
      setMedicationAlarms(medAlarms)
    } catch (err) {
      console.error('Failed to delete medication alarm', err)
      alert('삭제에 실패했습니다.')
    }
  }

  const dayEvents = selectedDate ? getEventsForDate(selectedDate) : []

  if (loading) {
    return (
      <div className="flex flex-col h-dvh max-w-[430px] mx-auto bg-[#F4FCFB] items-center justify-center">
        <p className="text-[14px] text-[#94A3B8]">캘린더 불러오는 중...</p>
        <BottomNav />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-dvh max-w-[430px] mx-auto bg-[#F4FCFB] overflow-hidden">

      {view === 'calendar' && (
        <div className="flex-1 overflow-y-auto px-5 pt-6 pb-6 mt-2 relative">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-[24px] font-black tracking-tight text-[#334155]">
              캘린더
            </h1>
            <div className="flex items-center bg-white rounded-full shadow-sm border border-[rgba(82,183,136,0.2)] p-[3px]">
              <button
                onClick={() => setCalendarMode('monthly')}
                className={`px-3 py-[5px] rounded-full text-[12px] font-semibold transition-all duration-200 ${calendarMode === 'monthly'
                  ? 'bg-[#52B788] text-white shadow-sm'
                  : 'text-[#64748B] hover:text-[#52B788]'
                  }`}
              >
                월간
              </button>
              <button
                onClick={() => { setCalendarMode('weekly'); setWeekOffset(0) }}
                className={`px-3 py-[5px] rounded-full text-[12px] font-semibold transition-all duration-200 ${calendarMode === 'weekly'
                  ? 'bg-[#52B788] text-white shadow-sm'
                  : 'text-[#64748B] hover:text-[#52B788]'
                  }`}
              >
                주간
              </button>
            </div>
          </div>

          <MedicationAlarmPanel
            alarms={medicationAlarms}
            onAdd={() => setView('med-form')}
            onDelete={handleDeleteMedication}
          />

          {calendarMode === 'monthly' && (
            <CalendarGrid
              year={year}
              month={month}
              events={events}
              onDayClick={handleDayClick}
              onPrevMonth={handlePrevMonth}
              onNextMonth={handleNextMonth}
            />
          )}

          {calendarMode === 'weekly' && (
            <WeeklyView
              year={year}
              month={month}
              events={events}
              onDayClick={handleDayClick}
              onPrevWeek={() => setWeekOffset((w) => w - 1)}
              onNextWeek={() => setWeekOffset((w) => w + 1)}
              weekOffset={weekOffset}
            />
          )}
        </div>
      )}

      {view === 'calendar' && showDayPopup && selectedDate && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-[72px] px-4 pb-24 bg-[#334155]/25"
          style={{ maxWidth: 430, margin: '0 auto' }}
          onClick={() => setShowDayPopup(false)}
        >
          <div className="w-full px-1" onClick={(e) => e.stopPropagation()}>
            <DayPopup
              date={selectedDate}
              events={dayEvents}
              onClose={() => setShowDayPopup(false)}
              onAddClinic={() => { setShowDayPopup(false); setView('clinic-form') }}
              onRemove={handleRemoveEvent}
            />
          </div>
        </div>
      )}

      {view === 'clinic-form' && selectedDate && (
        <ClinicForm
          date={selectedDate}
          children={children}
          onSave={handleSaveClinic}
          onBack={() => { setView('calendar'); setShowDayPopup(true) }}
          saving={saving}
        />
      )}

      {view === 'med-form' && (
        <MedForm
          children={children}
          onSave={handleSaveMed}
          onBack={() => setView('calendar')}
          saving={saving}
        />
      )}

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
              onClick={() => { setView('calendar'); if (selectedDate) setShowDayPopup(true) }}
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
