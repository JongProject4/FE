'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/lib/store'
import toast from 'react-hot-toast'
import {
  getChildren as fetchChildrenApi,
  getChild as fetchChildApi,
  createChild as createChildApi,
  patchChild as patchChildApi,
  type ChildResponse,
  type CreateChildRequest,
  type PatchChildRequest,
} from '@/lib/api'

type Gender = 'MALE' | 'FEMALE'

type FormState = {
  name: string
  birthdate: string
  gender: Gender
  height: string
  weight: string
  allergies: string
  medicalHistory: string
}

type ChildProfileFormProps = {
  mode: 'create' | 'edit'
  childId?: string | null
}

const EMPTY_FORM: FormState = {
  name: '',
  birthdate: '',
  gender: 'FEMALE',
  height: '',
  weight: '',
  allergies: '',
  medicalHistory: '',
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

function normalizeGender(value?: string | null): Gender {
  if (value === 'M' || value === 'MALE') return 'MALE'
  return 'FEMALE'
}

/** ChildResponse → 스토어 형식으로 변환 */
function childResponseToStoreChild(res: ChildResponse) {
  return {
    id: String(res.id),
    name: res.name,
    birthdate: normalizeBirthdate(res.birthdate),
    gender: res.gender,
    weight: res.weight,
    allergies: res.allergies,
  }
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
  const editLoadErrorHandledRef = useRef(false)
  const MY_PAGE_ROUTE = '/mypage'

  const textInputClassName =
    'block h-[52px] w-full appearance-none rounded-2xl border border-[rgba(82,183,136,0.2)] bg-[#F8FFFD] px-4 text-[16px] leading-[1.35] text-[#334155] placeholder-[#94A3B8] outline-none transition-colors focus:border-[#52B788] focus:ring-0 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500'

  const handleEditLoadError = (message: string) => {
    if (editLoadErrorHandledRef.current) return
    editLoadErrorHandledRef.current = true
    toast.error(message)
    router.replace(MY_PAGE_ROUTE)
  }

  // ── 아이 목록 로드 (create 모드일 때) ──
  useEffect(() => {
    if (isEditMode) return

    const loadChildren = async () => {
      try {
        const data = await fetchChildrenApi()
        const storeChildren = data.map(childResponseToStoreChild)
        setChildren(storeChildren)
      } catch {
        // 백엔드 연결 실패시 기존 로컬 데이터 유지
        console.warn('백엔드에서 아이 목록을 불러오지 못했습니다.')
      }
    }

    loadChildren()
  }, [isEditMode, setChildren])

  // ── 수정 모드: 아이 정보 로드 ──
  useEffect(() => {
    if (!isEditMode) {
      setForm(EMPTY_FORM)
      setLoading(false)
      return
    }

    if (!targetChildId) {
      setLoading(false)
      handleEditLoadError('수정할 아이를 찾을 수 없습니다.')
      return
    }

    let mounted = true

    const applyChildToForm = (child: ChildResponse) => {
      if (!mounted) return
      setForm({
        name: child.name ?? '',
        birthdate: normalizeBirthdate(child.birthdate),
        gender: normalizeGender(child.gender),
        height: child.height != null ? String(child.height) : '',
        weight: child.weight != null ? String(child.weight) : '',
        allergies: child.allergies ?? '',
        medicalHistory: child.medicalHistory ?? '',
      })
    }

    const fetchChild = async () => {
      try {
        const childData = await fetchChildApi(Number(targetChildId))
        applyChildToForm(childData)
      } catch {
        // 백엔드 실패 시 로컬 children에서 찾기
        const localChild = children.find(
          (c) => String(c.id) === String(targetChildId)
        )
        if (localChild && mounted) {
          setForm({
            name: localChild.name ?? '',
            birthdate: normalizeBirthdate(localChild.birthdate),
            gender: normalizeGender(localChild.gender),
            height: '',
            weight: localChild.weight != null ? String(localChild.weight) : '',
            allergies: localChild.allergies ?? '',
            medicalHistory: '',
          })
        } else {
          handleEditLoadError('아이 정보를 불러오지 못했습니다.')
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchChild()

    return () => {
      mounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, targetChildId])

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.birthdate) {
      toast.error('이름과 생년월일을 입력해주세요.')
      return
    }

    if (form.height !== '' && Number(form.height) < 0) {
      toast.error('키는 0 이상으로 입력해주세요.')
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
      let savedChild: ChildResponse

      if (isEditMode) {
        // PATCH /api/children/{childId}
        const patchPayload: PatchChildRequest = {
          name: form.name.trim(),
          birthdate: `${form.birthdate}T00:00:00`,
          gender: form.gender,
          height: form.height === '' ? null : Number(form.height),
          weight: form.weight === '' ? null : Number(form.weight),
          medicalHistory: form.medicalHistory.trim(),
          allergies: form.allergies.trim(),
        }
        savedChild = await patchChildApi(Number(targetChildId), patchPayload)
      } else {
        // POST /api/children
        const createPayload: CreateChildRequest = {
          name: form.name.trim(),
          birthdate: `${form.birthdate}T00:00:00`,
          gender: form.gender,
          height: form.height === '' ? null : Number(form.height),
          weight: form.weight === '' ? null : Number(form.weight),
          medicalHistory: form.medicalHistory.trim(),
          allergies: form.allergies.trim(),
        }
        savedChild = await createChildApi(createPayload)
      }

      const storeChild = childResponseToStoreChild(savedChild)

      if (isEditMode) {
        const updatedChildren = children.map((existingChild) =>
          String(existingChild.id) === String(savedChild.id)
            ? storeChild
            : existingChild
        )
        setChildren(updatedChildren)
      } else {
        setChildren([...children, storeChild])
      }

      setSelectedChild(String(savedChild.id))

      toast.success(
        isEditMode
          ? `${savedChild.name} 정보가 수정되었습니다!`
          : `${savedChild.name} 프로필이 등록되었습니다!`
      )

      router.push('/chat')
    } catch (error) {
      console.error('Child save error:', error)
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
    <main className="mx-auto flex h-dvh max-w-[430px] flex-col overflow-hidden bg-[#F4FCFB] px-5 pt-6 pb-6 dark:bg-slate-950">
      <header className="mb-6 flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="이전 페이지로 이동"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#52B788] shadow-md transition-transform active:scale-95 dark:bg-slate-800 dark:text-[#52B788] dark:shadow-[0_4px_20px_rgba(0,0,0,0.35)]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <h1 className="text-[24px] font-black tracking-tight text-[#334155] dark:text-slate-100">
          {isEditMode ? '아이 정보 수정' : '아이 등록'}
        </h1>
      </header>

      <section className="flex min-h-0 flex-1 flex-col rounded-3xl bg-white p-5 shadow-xl dark:bg-slate-900 dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
          {!isEditMode && hasChildren && (
            <div className="mb-5 rounded-2xl border border-[rgba(0,201,255,0.15)] bg-[rgba(255,255,255,0.8)] p-4 dark:border-slate-700 dark:bg-slate-800/80">
              <p className="mb-3 text-[13px] font-black text-[#475569] dark:text-slate-100">
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
                      className="flex items-center gap-3 rounded-2xl border border-[rgba(82,183,136,0.12)] bg-[#F4FCFB] p-3 dark:border-slate-700 dark:bg-slate-800"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedChild(childIdValue)
                          router.push('/chat')
                        }}
                        className="flex flex-1 items-center gap-3 text-left"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#52B788] text-white font-bold shadow-sm">
                          {childInitial}
                        </div>

                        <div className="min-w-0">
                          <div className="truncate text-[15px] font-bold text-[#334155] dark:text-slate-100">
                            {childName}
                          </div>
                          <div className="text-[12px] text-[#64748B] dark:text-slate-400">
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
                        className="rounded-xl border border-[rgba(82,183,136,0.35)] bg-white px-3 py-2 text-[12px] font-bold text-[#52B788] transition-transform active:scale-[0.98] dark:border-slate-600 dark:bg-slate-800 dark:text-[#6EE7B7]"
                      >
                        편집
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex min-h-[320px] items-center justify-center">
              <div className="flex items-center gap-2 text-[14px] font-semibold text-[#475569] dark:text-slate-300">
                <div className="h-5 w-5 rounded-full border-2 border-[#52B788] border-t-transparent animate-spin" />
                정보를 불러오는 중...
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-[13px] font-black text-[#475569] dark:text-slate-200">
                  아이 이름 *
                </label>
                <input
                  type="text"
                  name="childName"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  enterKeyHint="next"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="예: 김지아"
                  className={textInputClassName}
                />
              </div>

              <div>
                <label className="mb-2 block text-[13px] font-black text-[#475569] dark:text-slate-200">
                  생년월일 *
                </label>
                <input
                  type="date"
                  value={form.birthdate}
                  onChange={(e) => setForm({ ...form, birthdate: e.target.value })}
                  max={maxBirthdate}
                  className="w-full rounded-2xl border border-[rgba(82,183,136,0.2)] bg-[#F8FFFD] px-4 py-3.5 text-[15px] font-medium text-[#334155] outline-none transition-colors focus:border-[#52B788] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-[13px] font-black text-[#475569] dark:text-slate-200">
                  성별 *
                </label>
                <div className="flex gap-3">
                  {([
                    ['FEMALE', '여아'],
                    ['MALE', '남아'],
                  ] as const).map(([val, label]) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setForm({ ...form, gender: val })}
                      className={`flex-1 rounded-2xl py-3.5 text-[15px] font-black transition-all ${form.gender === val
                          ? 'border border-[#52B788] bg-[rgba(82,183,136,0.12)] text-[#52B788] shadow-sm'
                          : 'border border-[rgba(82,183,136,0.2)] bg-white text-[#475569] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-2 block text-[13px] font-black text-[#475569] dark:text-slate-200">
                    키
                    <span className="ml-1 text-[12px] font-medium text-[#94A3B8] dark:text-slate-400">
                      선택사항
                    </span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={form.height}
                      onChange={(e) => setForm({ ...form, height: e.target.value })}
                      placeholder="예: 95.5"
                      step="0.1"
                      min="0"
                      className="w-full rounded-2xl border border-[rgba(82,183,136,0.2)] bg-[#F8FFFD] px-4 py-3.5 text-[15px] font-medium text-[#334155] placeholder-[#94A3B8] outline-none transition-colors focus:border-[#52B788] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
                    />
                    <span className="text-[14px] font-bold text-[#475569] dark:text-slate-200">
                      cm
                    </span>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-[13px] font-black text-[#475569] dark:text-slate-200">
                    체중 (kg)
                    <span className="ml-1 text-[12px] font-medium text-[#94A3B8] dark:text-slate-400">
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
                    className="w-full rounded-2xl border border-[rgba(82,183,136,0.2)] bg-[#F8FFFD] px-4 py-3.5 text-[15px] font-medium text-[#334155] placeholder-[#94A3B8] outline-none transition-colors focus:border-[#52B788] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-[13px] font-black text-[#475569] dark:text-slate-200">
                  알레르기
                  <span className="ml-1 text-[12px] font-medium text-[#94A3B8] dark:text-slate-400">
                    선택사항
                  </span>
                </label>
                <input
                  type="text"
                  value={form.allergies}
                  onChange={(e) => setForm({ ...form, allergies: e.target.value })}
                  placeholder="예: 견과류, 유제품, 계란"
                  className="w-full rounded-2xl border border-[rgba(82,183,136,0.2)] bg-[#F8FFFD] px-4 py-3.5 text-[15px] font-medium text-[#334155] placeholder-[#94A3B8] outline-none transition-colors focus:border-[#52B788] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
                />
                <p className="mt-1.5 ml-1 text-[11px] font-medium text-[#94A3B8] dark:text-slate-400">
                  여러 항목은 쉼표(,)로 구분해서 입력해주세요.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-[13px] font-black text-[#475569] dark:text-slate-200">
                  과거 병력 / 지병
                  <span className="ml-1 text-[12px] font-medium text-[#94A3B8] dark:text-slate-400">
                    선택사항
                  </span>
                </label>
                <input
                  type="text"
                  value={form.medicalHistory}
                  onChange={(e) => setForm({ ...form, medicalHistory: e.target.value })}
                  placeholder="예: 천식, 아토피"
                  className="w-full rounded-2xl border border-[rgba(82,183,136,0.2)] bg-[#F8FFFD] px-4 py-3.5 text-[15px] font-medium text-[#334155] placeholder-[#94A3B8] outline-none transition-colors focus:border-[#52B788] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
                />
                <p className="mt-1.5 ml-1 text-[11px] font-medium text-[#94A3B8] dark:text-slate-400">
                  여러 항목은 쉼표(,)로 구분해서 입력해주세요.
                </p>
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving || !form.name.trim() || !form.birthdate}
          className="mt-4 w-full rounded-2xl bg-[rgba(82,183,136,0.12)] py-4 text-[15px] font-black text-[#52B788] shadow-lg transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[rgba(82,183,136,0.18)] dark:text-[#6EE7B7] dark:shadow-[0_6px_20px_rgba(0,0,0,0.25)]"
        >
          {saving ? (
            <div className="flex items-center justify-center gap-2">
              <div className="h-5 w-5 rounded-full border-2 border-[#52B788] border-t-transparent animate-spin dark:border-[#6EE7B7] dark:border-t-transparent" />
              {isEditMode ? '수정 중...' : '저장 중...'}
            </div>
          ) : isEditMode ? (
            '수정 완료하기'
          ) : (
            '저장하고 상담 시작하기'
          )}
        </button>
      </section>
    </main>
  )
}