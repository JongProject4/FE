'use client'
// src/app/child-setup/page.tsx
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useAppStore } from '@/lib/store'
import toast from 'react-hot-toast'

export default function ChildSetupPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const { setSelectedChild, setChildren, children } = useAppStore()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '',
    birthdate: '',
    gender: 'FEMALE' as 'MALE' | 'FEMALE',
    weight: '',
    allergies: '',
  })

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.birthdate) {
      toast.error('이름과 생년월일을 입력해주세요.')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/children', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      const child = await res.json()
      setChildren([...children, child])
      setSelectedChild(child.id)
      toast.success(`${child.name} 프로필이 등록되었습니다!`)
      router.push('/chat')
    } catch {
      toast.error('저장에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setSaving(false)
    }
  }

  const hasChildren = children.length > 0

  return (
    <main className="flex flex-col h-dvh max-w-[430px] mx-auto bg-[#F4FCFB] overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3.5 bg-white border-b border-[rgba(82,183,136,0.12)] flex-shrink-0">
        {hasChildren && (
          <button onClick={() => router.back()}
            className="w-9 h-9 bg-[#F4FCFB] rounded-[10px] flex items-center justify-center border border-[rgba(82,183,136,0.15)]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="2.5">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        )}
        <h1 className="text-[17px] font-bold text-[#334155]">아이 프로필 등록</h1>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-5">

        {/* Existing children picker */}
        {hasChildren && (
          <div className="bg-white rounded-[16px] p-4 border border-[rgba(82,183,136,0.12)]">
            <p className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-3">등록된 아이</p>
            <div className="flex flex-col gap-2">
              {children.map((c) => (
                <button key={c.id}
                  onClick={() => { setSelectedChild(c.id); router.push('/chat') }}
                  className="flex items-center gap-3 p-3 rounded-[12px] bg-[#F4FCFB] hover:bg-[rgba(82,183,136,0.08)] active:scale-[0.98] transition-all border border-transparent hover:border-[#52B788]">
                  <div className="w-10 h-10 rounded-full bg-[#52B788] flex items-center justify-center text-white font-bold">
                    {c.name.charAt(0)}
                  </div>
                  <div className="text-left">
                    <div className="text-[14px] font-semibold text-[#334155]">{c.name}</div>
                    <div className="text-[12px] text-[#475569]">
                      {c.gender === 'FEMALE' ? '여아' : '남아'}
                      {c.weight ? ` · ${c.weight}kg` : ''}
                    </div>
                  </div>
                  <svg className="ml-auto" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3 mt-4 mb-1">
              <div className="flex-1 h-px bg-[rgba(82,183,136,0.1)]" />
              <span className="text-[11px] text-[#94A3B8]">새 아이 추가</span>
              <div className="flex-1 h-px bg-[rgba(82,183,136,0.1)]" />
            </div>
          </div>
        )}

        {/* Name */}
        <div>
          <label className="text-[11px] font-semibold text-[#475569] uppercase tracking-wider block mb-2">
            아이 이름 *
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="예: 김지아"
            className="w-full px-4 py-3.5 bg-white border border-[rgba(82,183,136,0.2)] rounded-[14px] text-[15px] text-[#334155] placeholder-[#94A3B8] focus:border-[#52B788] transition-colors outline-none"
          />
        </div>

        {/* Birthdate */}
        <div>
          <label className="text-[11px] font-semibold text-[#475569] uppercase tracking-wider block mb-2">
            생년월일 *
          </label>
          <input
            type="date"
            value={form.birthdate}
            onChange={(e) => setForm({ ...form, birthdate: e.target.value })}
            max={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-3.5 bg-white border border-[rgba(82,183,136,0.2)] rounded-[14px] text-[15px] text-[#334155] focus:border-[#52B788] transition-colors outline-none"
          />
        </div>

        {/* Gender */}
        <div>
          <label className="text-[11px] font-semibold text-[#475569] uppercase tracking-wider block mb-2">
            성별 *
          </label>
          <div className="flex gap-3">
            {([['FEMALE', '여아 👧'], ['MALE', '남아 👦']] as const).map(([val, label]) => (
              <button
                key={val}
                onClick={() => setForm({ ...form, gender: val })}
                className={`flex-1 py-3.5 rounded-[14px] text-[15px] font-semibold border transition-all ${form.gender === val
                    ? 'bg-[rgba(82,183,136,0.12)] border-[#52B788] text-[#52B788]'
                    : 'bg-white border-[rgba(82,183,136,0.2)] text-[#475569]'
                  }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Weight */}
        <div>
          <label className="text-[11px] font-semibold text-[#475569] uppercase tracking-wider block mb-2">
            체중 (kg) <span className="text-[#94A3B8] normal-case font-normal">선택사항</span>
          </label>
          <input
            type="number"
            value={form.weight}
            onChange={(e) => setForm({ ...form, weight: e.target.value })}
            placeholder="예: 15.5"
            step="0.1"
            min="0"
            className="w-full px-4 py-3.5 bg-white border border-[rgba(82,183,136,0.2)] rounded-[14px] text-[15px] text-[#334155] placeholder-[#94A3B8] focus:border-[#52B788] transition-colors outline-none"
          />
        </div>

        {/* Allergies */}
        <div>
          <label className="text-[11px] font-semibold text-[#475569] uppercase tracking-wider block mb-2">
            알레르기 <span className="text-[#94A3B8] normal-case font-normal">선택사항</span>
          </label>
          <input
            type="text"
            value={form.allergies}
            onChange={(e) => setForm({ ...form, allergies: e.target.value })}
            placeholder="예: 견과류, 유제품, 계란"
            className="w-full px-4 py-3.5 bg-white border border-[rgba(82,183,136,0.2)] rounded-[14px] text-[15px] text-[#334155] placeholder-[#94A3B8] focus:border-[#52B788] transition-colors outline-none"
          />
          <p className="text-[11px] text-[#94A3B8] mt-1.5 ml-1">AI 답변에 자동으로 반영됩니다</p>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={saving || !form.name.trim() || !form.birthdate}
          className="w-full py-4 bg-gradient-to-r from-[#52B788] to-[#6EE7B7] rounded-[16px] text-[16px] font-bold text-white active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2 shadow-md"
        >
          {saving ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              저장 중...
            </div>
          ) : (
            '저장하고 상담 시작하기'
          )}
        </button>
      </div>
    </main>
  )
}
