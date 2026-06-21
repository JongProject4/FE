'use client'
// src/components/calendar/MedForm.tsx
import { useState } from 'react'
import { Child } from './types'
import type { MedicationAlarmRequest } from '@/lib/api'
import { useAppStore } from '@/lib/store'

export interface MedFormSavePayload {
  childId: string
  request: MedicationAlarmRequest
}

interface Props {
  children: Child[]
  onSave: (payload: MedFormSavePayload) => void | Promise<void>
  onBack: () => void
  saving?: boolean
}

const MIN_INTERVAL_HOUR = 1
const MAX_INTERVAL_HOUR = 48

export function MedForm({ children, onSave, onBack, saving = false }: Props) {
  const selectedChildId = useAppStore((s) => s.selectedChildId)
  // 전역 선택된 아이가 있으면 그 값을 기본값으로. 없을 때만 첫째로 fallback.
  const initialChildId =
    (selectedChildId && children.some((c) => c.id === selectedChildId) ? selectedChildId : children[0]?.id) || ''
  const [childId, setChildId] = useState(initialChildId)
  const [medicineName, setMedicineName] = useState('')
  const [dosage, setDosage] = useState('')
  const [intervalHourInput, setIntervalHourInput] = useState('4')
  const [isActive, setIsActive] = useState(true)

  const parseIntervalHour = (): number => {
    const parsed = parseInt(intervalHourInput, 10)
    if (Number.isNaN(parsed)) return 4
    return Math.min(MAX_INTERVAL_HOUR, Math.max(MIN_INTERVAL_HOUR, parsed))
  }

  const handleSave = () => {
    onSave({
      childId,
      request: {
        medicineName: medicineName.trim() || '약',
        dosage: dosage.trim() || '1회분',
        intervalHour: parseIntervalHour(),
        isActive,
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
          <h2 className="text-[16px] font-semibold text-[#334155]">복약 알림</h2>
          <p className="text-[11px] text-[#475569]">일정 간격으로 복용 알림</p>
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
          <label className="block text-[11px] font-semibold text-[#475569] uppercase tracking-wider mb-1.5">약 이름</label>
          <input type="text" value={medicineName} onChange={(e) => setMedicineName(e.target.value)}
            placeholder="예: 타이레놀 시럽"
            className="w-full px-3 py-2.5 border border-[rgba(82,183,136,0.2)] rounded-xl text-[14px] text-[#334155] bg-white outline-none focus:border-[#52B788] placeholder-[#94A3B8]" />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-[#475569] uppercase tracking-wider mb-1.5">복용량</label>
          <input type="text" value={dosage} onChange={(e) => setDosage(e.target.value)}
            placeholder="예: 5ml, 1정"
            className="w-full px-3 py-2.5 border border-[rgba(82,183,136,0.2)] rounded-xl text-[14px] text-[#334155] bg-white outline-none focus:border-[#52B788] placeholder-[#94A3B8]" />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-[#475569] uppercase tracking-wider mb-1.5">복용 간격</label>
          <div className="flex items-center gap-2 p-3 bg-[rgba(82,183,136,0.04)] rounded-xl border border-[rgba(82,183,136,0.15)]">
            <input
              type="number"
              min={MIN_INTERVAL_HOUR}
              max={MAX_INTERVAL_HOUR}
              value={intervalHourInput}
              onChange={(e) => setIntervalHourInput(e.target.value)}
              placeholder="4"
              className="w-[72px] px-2 py-1.5 border border-[rgba(82,183,136,0.2)] rounded-lg text-[14px] text-center text-[#334155] outline-none focus:border-[#52B788] bg-white"
            />
            <span className="text-[14px] text-[#334155] font-medium">시간마다</span>
            <span className="text-[11px] text-[#94A3B8] ml-auto">{MIN_INTERVAL_HOUR}~{MAX_INTERVAL_HOUR}시간</span>
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-[#475569] uppercase tracking-wider mb-1.5">알림 활성화</label>
          <div className="flex gap-4">
            {[['yes', '예', true], ['no', '아니요', false]].map(([val, label, bool]) => (
              <label key={String(val)} className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="med-active" checked={isActive === bool}
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
