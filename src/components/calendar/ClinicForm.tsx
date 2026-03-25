'use client'
// src/components/calendar/ClinicForm.tsx
import { useState } from 'react'
import { Child, ClinicRecord, MedEntry } from './types'
import { generateId, dateKey } from './utils'

interface Props {
  date: Date
  children: Child[]
  onSave: (record: ClinicRecord) => void
  onBack: () => void
}

interface MedEntryField {
  name: string
  startYear: string; startMonth: string; startDay: string
  endYear: string;   endMonth: string;   endDay: string
}

export function ClinicForm({ date, children, onSave, onBack }: Props) {
  const [childId, setChildId] = useState(children[0]?.id || '')
  const [hospital, setHospital] = useState('')
  const [diagnosis, setDiagnosis] = useState('')
  const [hasNextVisit, setHasNextVisit] = useState(false)
  const [nextYear, setNextYear] = useState('')
  const [nextMonth, setNextMonth] = useState('')
  const [nextDay, setNextDay] = useState('')
  const [meds, setMeds] = useState<MedEntryField[]>([])

  const addMed = () =>
    setMeds(prev => [...prev, { name: '', startYear: '', startMonth: '', startDay: '', endYear: '', endMonth: '', endDay: '' }])

  const updateMed = (i: number, field: keyof MedEntryField, value: string) =>
    setMeds(prev => prev.map((m, idx) => idx === i ? { ...m, [field]: value } : m))

  const handleSave = () => {
    const selectedChild = children.find(c => c.id === childId)
    const medications: MedEntry[] = meds
      .filter(m => m.name.trim())
      .map(m => ({
        name: m.name,
        startDate: `${m.startYear}-${m.startMonth}-${m.startDay}`,
        endDate: `${m.endYear}-${m.endMonth}-${m.endDay}`,
      }))

    const record: ClinicRecord = {
      id: generateId(),
      type: 'clinic',
      childId,
      childName: selectedChild?.name || '',
      hospital: hospital.trim() || '소아과의원',
      diagnosis: diagnosis.trim() || '진료',
      hasNextVisit,
      nextVisitDate: hasNextVisit ? `${nextYear}-${nextMonth}-${nextDay}` : undefined,
      medications,
      date: dateKey(date),
      createdAt: new Date().toISOString(),
    }
    onSave(record)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[rgba(74,144,217,0.12)] flex-shrink-0">
        <button onClick={onBack}
          className="w-8 h-8 rounded-full border border-[rgba(74,144,217,0.2)] flex items-center justify-center text-[#6B7A99] hover:bg-[#EBF4FF] transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <div>
          <h2 className="text-[16px] font-semibold text-[#1A2340]">내원 기록</h2>
          <p className="text-[11px] text-[#A0AABF]">{date.getMonth()+1}월 {date.getDate()}일</p>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Child selector */}
        <div>
          <label className="block text-[11px] font-semibold text-[#A0AABF] uppercase tracking-wider mb-1.5">아이 선택</label>
          <select value={childId} onChange={e => setChildId(e.target.value)}
            className="w-full px-3 py-2.5 border border-[rgba(74,144,217,0.2)] rounded-xl text-[14px] text-[#1A2340] bg-[#F5F8FF] outline-none focus:border-[#4A90D9]">
            {children.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.age} {c.gender === 'FEMALE' ? '여아' : '남아'})</option>
            ))}
          </select>
        </div>

        {/* Hospital */}
        <div>
          <label className="block text-[11px] font-semibold text-[#A0AABF] uppercase tracking-wider mb-1.5">병원명</label>
          <input type="text" value={hospital} onChange={e => setHospital(e.target.value)}
            placeholder="예: 서울 소아과의원"
            className="w-full px-3 py-2.5 border border-[rgba(74,144,217,0.2)] rounded-xl text-[14px] text-[#1A2340] bg-[#F5F8FF] outline-none focus:border-[#4A90D9] placeholder-[#A0AABF]"/>
        </div>

        {/* Diagnosis */}
        <div>
          <label className="block text-[11px] font-semibold text-[#A0AABF] uppercase tracking-wider mb-1.5">진단명</label>
          <input type="text" value={diagnosis} onChange={e => setDiagnosis(e.target.value)}
            placeholder="예: 급성 상기도 감염"
            className="w-full px-3 py-2.5 border border-[rgba(74,144,217,0.2)] rounded-xl text-[14px] text-[#1A2340] bg-[#F5F8FF] outline-none focus:border-[#4A90D9] placeholder-[#A0AABF]"/>
        </div>

        {/* Next visit */}
        <div>
          <label className="block text-[11px] font-semibold text-[#A0AABF] uppercase tracking-wider mb-1.5">다음 내원 여부</label>
          <div className="flex gap-4">
            {[['yes', '예', true], ['no', '아니요', false]].map(([val, label, bool]) => (
              <label key={String(val)} className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="next-visit" checked={hasNextVisit === bool}
                  onChange={() => setHasNextVisit(bool as boolean)}
                  className="accent-[#4A90D9]"/>
                <span className="text-[14px] text-[#1A2340]">{String(label)}</span>
              </label>
            ))}
          </div>
          {hasNextVisit && (
            <div className="mt-2 p-3 bg-[#F5F8FF] rounded-xl border border-[rgba(74,144,217,0.15)]">
              <label className="block text-[11px] text-[#A0AABF] mb-2">다음 내원 예정일</label>
              <div className="flex items-center gap-1.5 flex-wrap">
                <input type="number" placeholder="년" value={nextYear} onChange={e => setNextYear(e.target.value)}
                  className="w-[68px] px-2 py-1.5 border border-[rgba(74,144,217,0.2)] rounded-lg text-[13px] text-[#1A2340] bg-white outline-none text-center"/>
                <span className="text-[12px] text-[#6B7A99]">년</span>
                <input type="number" placeholder="월" min={1} max={12} value={nextMonth} onChange={e => setNextMonth(e.target.value)}
                  className="w-[52px] px-2 py-1.5 border border-[rgba(74,144,217,0.2)] rounded-lg text-[13px] text-[#1A2340] bg-white outline-none text-center"/>
                <span className="text-[12px] text-[#6B7A99]">월</span>
                <input type="number" placeholder="일" min={1} max={31} value={nextDay} onChange={e => setNextDay(e.target.value)}
                  className="w-[52px] px-2 py-1.5 border border-[rgba(74,144,217,0.2)] rounded-lg text-[13px] text-[#1A2340] bg-white outline-none text-center"/>
                <span className="text-[12px] text-[#6B7A99]">일</span>
              </div>
            </div>
          )}
        </div>

        {/* Medications section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[11px] font-semibold text-[#A0AABF] uppercase tracking-wider">복약 기록 (선택)</label>
          </div>
          {meds.map((med, i) => (
            <div key={i} className="p-3 bg-[#F5F8FF] rounded-xl border border-[rgba(74,144,217,0.12)] mb-2">
              <input type="text" placeholder="약명" value={med.name} onChange={e => updateMed(i, 'name', e.target.value)}
                className="w-full px-3 py-2 border border-[rgba(74,144,217,0.2)] rounded-lg text-[13px] text-[#1A2340] bg-white outline-none focus:border-[#4A90D9] placeholder-[#A0AABF] mb-2"/>
              <div className="text-[11px] text-[#A0AABF] mb-1">복용 기간</div>
              <div className="flex items-center gap-1 flex-wrap text-[12px]">
                <input type="number" placeholder="년" value={med.startYear} onChange={e => updateMed(i,'startYear',e.target.value)}
                  className="w-[60px] px-2 py-1 border border-[rgba(74,144,217,0.2)] rounded-lg text-[12px] bg-white outline-none text-center"/>
                <span className="text-[#6B7A99]">년</span>
                <input type="number" placeholder="월" min={1} max={12} value={med.startMonth} onChange={e => updateMed(i,'startMonth',e.target.value)}
                  className="w-[46px] px-1 py-1 border border-[rgba(74,144,217,0.2)] rounded-lg text-[12px] bg-white outline-none text-center"/>
                <span className="text-[#6B7A99]">월</span>
                <input type="number" placeholder="일" min={1} max={31} value={med.startDay} onChange={e => updateMed(i,'startDay',e.target.value)}
                  className="w-[46px] px-1 py-1 border border-[rgba(74,144,217,0.2)] rounded-lg text-[12px] bg-white outline-none text-center"/>
                <span className="text-[#A0AABF]">~</span>
                <input type="number" placeholder="년" value={med.endYear} onChange={e => updateMed(i,'endYear',e.target.value)}
                  className="w-[60px] px-2 py-1 border border-[rgba(74,144,217,0.2)] rounded-lg text-[12px] bg-white outline-none text-center"/>
                <span className="text-[#6B7A99]">년</span>
                <input type="number" placeholder="월" min={1} max={12} value={med.endMonth} onChange={e => updateMed(i,'endMonth',e.target.value)}
                  className="w-[46px] px-1 py-1 border border-[rgba(74,144,217,0.2)] rounded-lg text-[12px] bg-white outline-none text-center"/>
                <span className="text-[#6B7A99]">월</span>
                <input type="number" placeholder="일" min={1} max={31} value={med.endDay} onChange={e => updateMed(i,'endDay',e.target.value)}
                  className="w-[46px] px-1 py-1 border border-[rgba(74,144,217,0.2)] rounded-lg text-[12px] bg-white outline-none text-center"/>
                <span className="text-[#6B7A99]">일</span>
              </div>
            </div>
          ))}
          <button onClick={addMed}
            className="w-full py-2.5 rounded-xl border border-dashed border-[rgba(74,144,217,0.3)] text-[12px] text-[#6B7A99] hover:bg-[#EBF4FF] hover:text-[#4A90D9] hover:border-[#4A90D9] transition-all flex items-center justify-center gap-1.5">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            약 추가
          </button>
        </div>

        {/* Save button */}
        <button onClick={handleSave}
          className="w-full py-3.5 rounded-xl bg-[#4A90D9] text-white text-[15px] font-semibold active:opacity-85 transition-opacity">
          저장하기
        </button>
      </div>
    </div>
  )
}
