'use client'
// src/components/calendar/MedForm.tsx
import { useState } from 'react'
import { Child, MedRecord } from './types'
import { generateId, dateKey, formatTime } from './utils'

interface Props {
  date: Date
  children: Child[]
  onSave: (record: MedRecord) => void
  onBack: () => void
}

interface TimeEntry { hour: string; minute: string }

export function MedForm({ date, children, onSave, onBack }: Props) {
  const [childId, setChildId] = useState(children[0]?.id || '')
  const [medName, setMedName] = useState('')
  const [startYear, setStartYear] = useState('')
  const [startMonth, setStartMonth] = useState('')
  const [startDay, setStartDay] = useState('')
  const [endYear, setEndYear] = useState('')
  const [endMonth, setEndMonth] = useState('')
  const [endDay, setEndDay] = useState('')
  const [times, setTimes] = useState<TimeEntry[]>([{ hour: '', minute: '' }])
  const [dosage, setDosage] = useState('')
  const [alarmEnabled, setAlarmEnabled] = useState(false)

  const addTime = () => setTimes(prev => [...prev, { hour: '', minute: '' }])
  const updateTime = (i: number, field: 'hour' | 'minute', value: string) =>
    setTimes(prev => prev.map((t, idx) => idx === i ? { ...t, [field]: value } : t))

  const handleSave = () => {
    const selectedChild = children.find(c => c.id === childId)
    const timeStrings = times
      .filter(t => t.hour)
      .map(t => formatTime(parseInt(t.hour) || 0, parseInt(t.minute) || 0))

    const record: MedRecord = {
      id: generateId(),
      type: 'med',
      childId,
      childName: selectedChild?.name || '',
      medName: medName.trim() || '약 기록',
      startDate: `${startYear}-${startMonth}-${startDay}`,
      endDate: `${endYear}-${endMonth}-${endDay}`,
      times: timeStrings,
      dosage: dosage.trim(),
      alarmEnabled,
      date: dateKey(date),
      createdAt: new Date().toISOString(),
    }
    onSave(record)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[rgba(82,183,136,0.12)] flex-shrink-0">
        <button onClick={onBack}
          className="w-8 h-8 rounded-full border border-[rgba(82,183,136,0.2)] flex items-center justify-center text-[#475569] hover:bg-[rgba(82,183,136,0.08)] transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6" /></svg>
        </button>
        <div>
          <h2 className="text-[16px] font-semibold text-[#334155]">복약 기록</h2>
          <p className="text-[11px] text-[#475569]">{date.getMonth() + 1}월 {date.getDate()}일</p>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Child */}
        <div>
          <label className="block text-[11px] font-semibold text-[#475569] uppercase tracking-wider mb-1.5">아이 선택</label>
          <select value={childId} onChange={e => setChildId(e.target.value)}
            className="w-full px-3 py-2.5 border border-[rgba(82,183,136,0.2)] rounded-xl text-[14px] text-[#334155] bg-white outline-none focus:border-[#52B788]">
            {children.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.age} {c.gender === 'FEMALE' ? '여아' : '남아'})</option>
            ))}
          </select>
        </div>

        {/* Med name */}
        <div>
          <label className="block text-[11px] font-semibold text-[#475569] uppercase tracking-wider mb-1.5">약명</label>
          <input type="text" value={medName} onChange={e => setMedName(e.target.value)}
            placeholder="예: 타이레놀 시럽"
            className="w-full px-3 py-2.5 border border-[rgba(82,183,136,0.2)] rounded-xl text-[14px] text-[#334155] bg-white outline-none focus:border-[#52B788] placeholder-[#94A3B8]" />
        </div>

        {/* Duration */}
        <div>
          <label className="block text-[11px] font-semibold text-[#475569] uppercase tracking-wider mb-1.5">복용 기간</label>
          <div className="p-3 bg-[rgba(82,183,136,0.04)] rounded-xl border border-[rgba(82,183,136,0.12)] space-y-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              {[['년', startYear, setStartYear, '70px', 'year'], ['월', startMonth, setStartMonth, '50px', '1', '12'], ['일', startDay, setStartDay, '50px', '1', '31']].map(([label, val, setter, w]) => (
                <>
                  <input key={String(label) + 's'} type="number" placeholder={String(label)} value={String(val)}
                    onChange={e => (setter as any)(e.target.value)}
                    className="px-2 py-1.5 border border-[rgba(82,183,136,0.2)] rounded-lg text-[13px] text-[#334155] bg-white outline-none text-center focus:border-[#52B788]"
                    style={{ width: String(w) }} />
                  <span className="text-[12px] text-[#475569]">{String(label)}</span>
                </>
              ))}
            </div>
            <div className="text-[11px] text-[#475569] font-semibold mt-1">~ 종료일</div>
            <div className="flex items-center gap-1.5 flex-wrap mt-1">
              <input type="number" placeholder="년" value={endYear} onChange={e => setEndYear(e.target.value)}
                className="w-[70px] px-2 py-1.5 border border-[rgba(82,183,136,0.2)] rounded-lg text-[13px] text-[#334155] bg-white outline-none text-center focus:border-[#52B788]" />
              <span className="text-[12px] text-[#475569]">년</span>
              <input type="number" placeholder="월" min={1} max={12} value={endMonth} onChange={e => setEndMonth(e.target.value)}
                className="w-[50px] px-1 py-1.5 border border-[rgba(82,183,136,0.2)] rounded-lg text-[13px] text-[#334155] bg-white outline-none text-center focus:border-[#52B788]" />
              <span className="text-[12px] text-[#475569]">월</span>
              <input type="number" placeholder="일" min={1} max={31} value={endDay} onChange={e => setEndDay(e.target.value)}
                className="w-[50px] px-1 py-1.5 border border-[rgba(82,183,136,0.2)] rounded-lg text-[13px] text-[#334155] bg-white outline-none text-center focus:border-[#52B788]" />
              <span className="text-[12px] text-[#475569]">일</span>
            </div>
          </div>
        </div>

        {/* Times */}
        <div>
          <label className="block text-[11px] font-semibold text-[#475569] uppercase tracking-wider mb-1.5">복용 시간</label>
          <div className="space-y-2">
            {times.map((t, i) => (
              <div key={i} className="flex items-center gap-2">
                <input type="number" placeholder="08" min={0} max={23} value={t.hour}
                  onChange={e => updateTime(i, 'hour', e.target.value)}
                  className="w-[60px] px-2 py-2 border border-[rgba(82,183,136,0.2)] rounded-lg text-[14px] text-[#334155] bg-white outline-none text-center focus:border-[#52B788] placeholder-[#94A3B8]" />
                <span className="text-[13px] text-[#475569]">시</span>
                <input type="number" placeholder="00" min={0} max={59} value={t.minute}
                  onChange={e => updateTime(i, 'minute', e.target.value)}
                  className="w-[60px] px-2 py-2 border border-[rgba(82,183,136,0.2)] rounded-lg text-[14px] text-[#334155] bg-white outline-none text-center focus:border-[#52B788] placeholder-[#94A3B8]" />
                <span className="text-[13px] text-[#475569]">분</span>
              </div>
            ))}
          </div>
          <button onClick={addTime}
            className="mt-2 flex items-center gap-1.5 text-[12px] text-[#52B788] hover:opacity-75 transition-opacity font-medium">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            시간 추가
          </button>
        </div>

        {/* Dosage */}
        <div>
          <label className="block text-[11px] font-semibold text-[#475569] uppercase tracking-wider mb-1.5">복용량</label>
          <input type="text" value={dosage} onChange={e => setDosage(e.target.value)}
            placeholder="예: 5ml, 1정"
            className="w-full px-3 py-2.5 border border-[rgba(82,183,136,0.2)] rounded-xl text-[14px] text-[#334155] bg-white outline-none focus:border-[#52B788] placeholder-[#94A3B8]" />
        </div>

        {/* Alarm */}
        <div>
          <label className="block text-[11px] font-semibold text-[#475569] uppercase tracking-wider mb-1.5">알림 활성화</label>
          <div className="flex gap-4">
            {[['yes', '예', true], ['no', '아니요', false]].map(([val, label, bool]) => (
              <label key={String(val)} className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="alarm" checked={alarmEnabled === bool}
                  onChange={() => setAlarmEnabled(bool as boolean)}
                  className="accent-[#52B788]" />
                <span className="text-[14px] text-[#334155]">{String(label)}</span>
              </label>
            ))}
          </div>
          {alarmEnabled && (
            <div className="mt-2 p-2.5 bg-[#F4FCFB] rounded-lg border border-[rgba(82,183,136,0.2)]">
              <p className="text-[12px] text-[#52B788] font-medium">
                설정한 복용 시간에 알림이 전송됩니다
              </p>
            </div>
          )}
        </div>

        {/* Save */}
        <button onClick={handleSave}
          className="w-full py-4 mt-2 bg-gradient-to-r from-[#52B788] to-[#6EE7B7] rounded-[16px] text-white text-[16px] font-bold active:scale-[0.98] transition-all shadow-md">
          저장하기
        </button>
      </div>
    </div>
  )
}
