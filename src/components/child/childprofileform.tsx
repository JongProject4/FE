'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/lib/store'
import toast from 'react-hot-toast'

type Gender = 'MALE' | 'FEMALE'

type ChildLike = {
  id?: string | number | null
  name?: string | null
  birthdate?: string | null
  gender?: Gender | null
  weight?: number | string | null
  allergies?: string | string[] | null
}

type FormState = {
  name: string
  birthdate: string
  gender: Gender
  weight: string
  allergies: string
}

type ChildProfileFormProps = {
  mode: 'create' | 'edit'
  childId?: string | null
}

const EMPTY_FORM: FormState = {
  name: '',
  birthdate: '',
  gender: 'FEMALE',
  weight: '',
  allergies: '',
}

function getTodayString() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const date = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${date}`
}

function normalizeBirthdate(value?: string | null) {
  if (!value) return ''
  return value.slice(0, 10)
}

function normalizeAllergies(value?: string | string[] | null) {
  if (!value) return ''
  return Array.isArray(value) ? value.join(', ') : value
}

export default function ChildProfileForm({
  mode,
  childId,
}: ChildProfileFormProps) {
  const router = useRouter()
  const { setSelectedChild, setChildren, children } = useAppStore()

  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(mode === 'edit')
  const [form, setForm] = useState<FormState>(EMPTY_FORM)

  const isEditMode = mode === 'edit'
  const hasChildren = children.length > 0
  const maxBirthdate = useMemo(() => getTodayString(), [])
  const targetChildId = childId ?? null

  useEffect(() => {
    if (!isEditMode) {
      setForm(EMPTY_FORM)
      setLoading(false)
      return
    }

    if (!targetChildId) {
      setLoading(false)
      toast.error('수정할 아이를 찾을 수 없습니다.')
      router.replace('/child-setup')
      return
    }

    let mounted = true

    const applyChildToForm = (child: ChildLike) => {
      if (!mounted) return

      setForm({
        name: child.name ?? '',
        birthdate: normalizeBirthdate(child.birthdate),
        gender: child.gender === 'MALE' ? 'MALE' : 'FEMALE',
        weight:
          child.weight === undefined || child.weight === null || child.weight === ''
            ? ''
            : String(child.weight),
        allergies: normalizeAllergies(child.allergies),
      })
    }

    const localChild = children.find(
      (child) => String(child.id) === String(targetChildId)
    )

    if (localChild) {
      applyChildToForm(localChild)
      setLoading(false)
      return
    }

    const fetchChild = async () => {
      try {
        const res = await fetch(`/api/children/${targetChildId}`, {
          method: 'GET',
          cache: 'no-store',
        })

        if (!res.ok) {
          throw new Error('failed to fetch child')
        }

        const fetchedChild = await res.json()
        applyChildToForm(fetchedChild)
      } catch {
        toast.error('아이 정보를 불러오지 못했습니다.')
        router.replace('/child-setup')
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    fetchChild()

    return () => {
      mounted = false
    }
  }, [isEditMode, targetChildId, children, router])

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.birthdate) {
      toast.error('이름과 생년월일을 입력해주세요.')
      return
    }

    if (form.weight !== '' && Number(form.weight) < 0) {
      toast.error('체중은 0 이상으로 입력해주세요.')
      return
    }

    if (isEditMode && !targetChildId) {
      toast.error('수정할 아이 정보가 없습니다.')
      return
    }

    setSaving(true)

    try {
      const payload = {
        name: form.name.trim(),
        birthdate: form.birthdate,
        gender: form.gender,
        weight: form.weight === '' ? null : Number(form.weight),
        allergies: form.allergies.trim(),
      }

      const res = await fetch(
        isEditMode ? `/api/children/${targetChildId}` : '/api/children',
        {
          method: isEditMode ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      )

      if (!res.ok) {
        throw new Error('save failed')
      }

      const savedChild = await res.json()

      if (isEditMode) {
        const updatedChildren = children.map((existingChild) =>
          String(existingChild.id) === String(savedChild.id)
            ? { ...existingChild, ...savedChild }
            : existingChild
        )
        setChildren(updatedChildren)
      } else {
        setChildren([...children, savedChild])
      }

      setSelectedChild(String(savedChild.id))

      toast.success(
        isEditMode
          ? `${savedChild.name} 정보가 수정되었습니다!`
          : `${savedChild.name} 프로필이 등록되었습니다!`
      )

      router.push('/chat')
    } catch {
      toast.error(
        isEditMode
          ? '수정에 실패했습니다. 다시 시도해주세요.'
          : '저장에 실패했습니다. 다시 시도해주세요.'
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="flex flex-col h-dvh max-w-[430px] mx-auto bg-[#F4FCFB] overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3.5 bg-white border-b border-[rgba(82,183,136,0.12)] flex-shrink-0">
        {(hasChildren || isEditMode) && (
          <button
            type="button"
            onClick={() => router.back()}
            className="w-9 h-9 bg-[#F4FCFB] rounded-[10px] flex items-center justify-center border border-[rgba(82,183,136,0.15)]"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#334155"
              strokeWidth="2.5"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        )}

        <h1 className="text-[17px] font-bold text-[#334155]">
          {isEditMode ? '아이 프로필 편집' : '아이 프로필 등록'}
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-5">
        {!isEditMode && hasChildren && (
          <div className="bg-white rounded-[16px] p-4 border border-[rgba(82,183,136,0.12)]">
            <p className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-3">
              등록된 아이
            </p>

            <div className="flex flex-col gap-2">
              {children.map((c) => {
                const childIdValue = String(c.id)
                const childName = c.name ?? ''
                const childInitial = childName ? childName.charAt(0) : '?'

                return (
                  <div
                    key={childIdValue}
                    className="flex items-center gap-3 p-3 rounded-[12px] bg-[#F4FCFB] border border-transparent hover:border-[#52B788] transition-all"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedChild(childIdValue)
                        router.push('/chat')
                      }}
                      className="flex items-center gap-3 flex-1 text-left"
                    >
                      <div className="w-10 h-10 rounded-full bg-[#52B788] flex items-center justify-center text-white font-bold">
                        {childInitial}
                      </div>

                      <div className="text-left">
                        <div className="text-[14px] font-semibold text-[#334155]">
                          {childName}
                        </div>
                        <div className="text-[12px] text-[#475569]">
                          {c.gender === 'FEMALE' ? '여아' : '남아'}
                          {c.weight ? ` · ${c.weight}kg` : ''}
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        router.push(`/child-edit?childId=${encodeURIComponent(childIdValue)}`)
                      }
                      className="px-3 py-2 text-[12px] font-semibold rounded-[10px] bg-white border border-[rgba(82,183,136,0.2)] text-[#52B788]"
                    >
                      편집
                    </button>
                  </div>
                )
              })}
            </div>

            <div className="flex items-center gap-3 mt-4 mb-1">
              <div className="flex-1 h-px bg-[rgba(82,183,136,0.1)]" />
              <span className="text-[11px] text-[#94A3B8]">새 아이 추가</span>
              <div className="flex-1 h-px bg-[rgba(82,183,136,0.1)]" />
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex-1 min-h-[300px] flex items-center justify-center">
            <div className="flex items-center gap-2 text-[#475569]">
              <div className="w-5 h-5 border-2 border-[#52B788] border-t-transparent rounded-full animate-spin" />
              정보를 불러오는 중...
            </div>
          </div>
        ) : (
          <>
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

            <div>
              <label className="text-[11px] font-semibold text-[#475569] uppercase tracking-wider block mb-2">
                생년월일 *
              </label>
              <input
                type="date"
                value={form.birthdate}
                onChange={(e) => setForm({ ...form, birthdate: e.target.value })}
                max={maxBirthdate}
                className="w-full px-4 py-3.5 bg-white border border-[rgba(82,183,136,0.2)] rounded-[14px] text-[15px] text-[#334155] focus:border-[#52B788] transition-colors outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#475569] uppercase tracking-wider block mb-2">
                성별 *
              </label>
              <div className="flex gap-3">
                {([
                  ['FEMALE', '여아 👧'],
                  ['MALE', '남아 👦'],
                ] as const).map(([val, label]) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setForm({ ...form, gender: val })}
                    className={`flex-1 py-3.5 rounded-[14px] text-[15px] font-semibold border transition-all ${
                      form.gender === val
                        ? 'bg-[rgba(82,183,136,0.12)] border-[#52B788] text-[#52B788]'
                        : 'bg-white border-[rgba(82,183,136,0.2)] text-[#475569]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#475569] uppercase tracking-wider block mb-2">
                체중 (kg){' '}
                <span className="text-[#94A3B8] normal-case font-normal">
                  선택사항
                </span>
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

            <div>
              <label className="text-[11px] font-semibold text-[#475569] uppercase tracking-wider block mb-2">
                알레르기{' '}
                <span className="text-[#94A3B8] normal-case font-normal">
                  선택사항
                </span>
              </label>
              <input
                type="text"
                value={form.allergies}
                onChange={(e) => setForm({ ...form, allergies: e.target.value })}
                placeholder="예: 견과류, 유제품, 계란"
                className="w-full px-4 py-3.5 bg-white border border-[rgba(82,183,136,0.2)] rounded-[14px] text-[15px] text-[#334155] placeholder-[#94A3B8] focus:border-[#52B788] transition-colors outline-none"
              />
              <p className="text-[11px] text-[#94A3B8] mt-1.5 ml-1">
                AI 답변에 자동으로 반영됩니다
              </p>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving || !form.name.trim() || !form.birthdate}
              className="w-full py-4 bg-gradient-to-r from-[#52B788] to-[#6EE7B7] rounded-[16px] text-[16px] font-bold text-white active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2 shadow-md"
            >
              {saving ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {isEditMode ? '수정 중...' : '저장 중...'}
                </div>
              ) : isEditMode ? (
                '수정 완료하기'
              ) : (
                '저장하고 상담 시작하기'
              )}
            </button>
          </>
        )}
      </div>
    </main>
  )
}