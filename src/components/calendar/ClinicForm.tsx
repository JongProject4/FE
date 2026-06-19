'use client'
// src/components/calendar/ClinicForm.tsx
import { useState } from 'react'
import { Child, ClinicRecord } from './types'
import { dateKey, toLocalDateTimeString } from './utils'
import type { HospitalAlarmRequest } from '@/lib/api'

export interface ClinicFormSavePayload {
  childId: string
  request: HospitalAlarmRequest
  preview: Omit<ClinicRecord, 'alarmId'> & { alarmId?: number }
}

interface Props {
  date: Date
  children: Child[]
  onSave: (payload: ClinicFormSavePayload) => void | Promise<void>
  onBack: () => void
  saving?: boolean
}

export function ClinicForm({ date, children, onSave, onBack, saving = false }: Props) {
  const [childId, setChildId] = useState(children[0]?.id || '')
  const [hospitalName, setHospitalName] = useState('')
  const [visitHour, setVisitHour] = useState(String(date.getHours() || 10))
  const [visitMinute, setVisitMinute] = useState(String(date.getMinutes() || 0).padStart(2, '0'))
  const [memo, setMemo] = useState('')
  const [isActive, setIsActive] = useState(true)

  const handleSave = () => {
    const selectedChild = children.find((c) => c.id === childId)
    const h = Math.min(23, Math.max(0, parseInt(visitHour, 10) || 0))
    const m = Math.min(59, Math.max(0, parseInt(visitMinute, 10) || 0))
    const visitDate = toLocalDateTimeString(date, h, m)

    const request: HospitalAlarmRequest = {
      hospitalName: hospitalName.trim() || '소아과의원',
      visitDate,
      memo: memo.trim() || undefined,
      isActive,
    }

    onSave({
      childId,
      request,
      preview: {
        id: 'pending',
        type: 'clinic',
        childId,
        childName: selectedChild?.name || '',
        hospitalName: request.hospitalName,
        visitDate,
        memo: memo.trim(),
        isActive,
        date: dateKey(date),
        createdAt: visitDate,
      },
    })
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[rgba(82,183,136,0.12)] flex-shrink-0">
        <button onClick={onBack}
          className="w-8 h-8 rounded-full border border-[rgba(82,183,136,0.2)] flex items-center justify-center text-[#475569] hover:bg-[rgba(82,183,136,0.08)] transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6" /></svg>
        </button>
        <div>
          <h2 className="text-[16px] font-semibold text-[#334155]">내원 알림</h2>
          <p className="text-[11px] text-[#475569]">{date.getMonth() + 1}월 {date.getDate()}일</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <div>
          <label className="block text-[11px] font-semibold text-[#475569] uppercase tracking-wider mb-1.5">아이 선택</label>
          <select value={childId} onChange={(e) => setChildId(e.target.value)}
            className="w-full px-3 py-2.5 border border-[rgba(82,183,136,0.2)] rounded-xl text-[14px] text-[#334155] bg-white outline-none focus:border-[#52B788]">
            {children.map((c) => (
              <option key={c.id} value={c.id}>{c.name} ({c.age} {c.gender === 'FEMALE' ? '여아' : '남아'})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-[#475569] uppercase tracking-wider mb-1.5">병원명</label>
          <input type="text" value={hospitalName} onChange={(e) => setHospitalName(e.target.value)}
            placeholder="예: 서울 소아과의원"
            className="w-full px-3 py-2.5 border border-[rgba(82,183,136,0.2)] rounded-xl text-[14px] text-[#334155] bg-white outline-none focus:border-[#52B788] placeholder-[#94A3B8]" />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-[#475569] uppercase tracking-wider mb-1.5">방문 일시</label>
          <div className="flex items-center gap-2 p-3 bg-[rgba(82,183,136,0.04)] rounded-xl border border-[rgba(82,183,136,0.15)]">
            <span className="text-[13px] text-[#334155] font-medium shrink-0">
              {date.getMonth() + 1}/{date.getDate()}
            </span>
            <input type="number" min={0} max={23} value={visitHour} onChange={(e) => setVisitHour(e.target.value)}
              className="w-[52px] px-2 py-1.5 border border-[rgba(82,183,136,0.2)] rounded-lg text-[13px] text-center outline-none focus:border-[#52B788]" />
            <span className="text-[12px] text-[#475569]">시</span>
            <input type="number" min={0} max={59} value={visitMinute} onChange={(e) => setVisitMinute(e.target.value)}
              className="w-[52px] px-2 py-1.5 border border-[rgba(82,183,136,0.2)] rounded-lg text-[13px] text-center outline-none focus:border-[#52B788]" />
            <span className="text-[12px] text-[#475569]">분</span>
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-[#475569] uppercase tracking-wider mb-1.5">메모</label>
          <textarea value={memo} onChange={(e) => setMemo(e.target.value)}
            placeholder="진료 내용, 주의사항 등"
            rows={3}
            className="w-full px-3 py-2.5 border border-[rgba(82,183,136,0.2)] rounded-xl text-[14px] text-[#334155] bg-white outline-none focus:border-[#52B788] placeholder-[#94A3B8] resize-none" />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-[#475569] uppercase tracking-wider mb-1.5">알림 활성화</label>
          <div className="flex gap-4">
            {[['yes', '예', true], ['no', '아니요', false]].map(([val, label, bool]) => (
              <label key={String(val)} className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="hospital-active" checked={isActive === bool}
                  onChange={() => setIsActive(bool as boolean)}
                  className="accent-[#52B788]" />
                <span className="text-[14px] text-[#334155]">{String(label)}</span>
              </label>
            ))}
          </div>
        </div>

        <button onClick={handleSave} disabled={saving}
          className="w-full py-4 mt-2 bg-gradient-to-r from-[#52B788] to-[#6EE7B7] rounded-[16px] text-white text-[16px] font-bold active:scale-[0.98] transition-all shadow-md disabled:opacity-60">
          {saving ? '저장 중...' : '저장하기'}
        </button>
      </div>
    </div>
  )
}
