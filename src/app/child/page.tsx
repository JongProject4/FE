"use client";

import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { getChild as fetchChildApi, deleteChild as deleteChildApi, type ChildResponse } from '@/lib/api';
import toast from 'react-hot-toast';

type Gender = "MALE" | "FEMALE" | "M" | "F";

type ChildLike = {
  id: string | number;
  name?: string | null;
  birthdate?: string | null;
  gender?: Gender | null;
  height?: number | string | null;
  weight?: number | string | null;
  allergies?: string | string[] | null;
  medical_history?: string | string[] | null;
  medicalHistory?: string | string[] | null;
};

type ChildSource = Partial<ChildLike> & {
  id: string | number;
};

function normalizeGender(value?: string | null) {
  if (!value) return "등록된 정보 없음";
  if (value === "M" || value === "MALE") return "남아";
  if (value === "F" || value === "FEMALE") return "여아";
  return "등록된 정보 없음";
}

function formatTextField(value?: string | string[] | null) {
  if (!value) return "등록된 정보 없음";
  return Array.isArray(value) ? value.join(", ") : value;
}

function normalizeChild(source?: ChildSource): ChildLike | undefined {
  if (!source) return undefined;

  return {
    id: source.id,
    name: source.name ?? null,
    birthdate: source.birthdate ?? null,
    gender: source.gender ?? null,
    height: source.height ?? null,
    weight: source.weight ?? null,
    allergies: source.allergies ?? null,
    medicalHistory: source.medicalHistory ?? null,
    medical_history: source.medical_history ?? null,
  };
}

function InfoRow({
  label,
  value,
  multiline = false,
}: {
  label: string;
  value: string;
  multiline?: boolean;
}) {
  return (
    <div className="border-b border-[rgba(82,183,136,0.12)] py-4 last:border-b-0">
      <p className="mb-1 text-[13px] font-black text-[#475569] dark:text-slate-300">
        {label}
      </p>
      <p
        className={`text-[16px] font-bold text-[#334155] dark:text-slate-100 ${multiline ? "whitespace-pre-line leading-7" : ""
          }`}
      >
        {value?.trim() ? value : "등록된 정보 없음"}
      </p>
    </div>
  );
}

function ChildDetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [deleteTarget, setDeleteTarget] = useState<ChildLike | null>(null);
  const [child, setChild] = useState<ChildLike | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  const childId = searchParams.get("childId");

  useEffect(() => {
    if (!childId) {
      setLoading(false);
      return;
    }

    const loadChild = async () => {
      try {
        const data = await fetchChildApi(Number(childId));
        setChild(normalizeChild(data));
      } catch {
        console.warn('아이 정보 로드 실패');
      } finally {
        setLoading(false);
      }
    };
    loadChild();
  }, [childId]);

  const handleEdit = () => {
    if (!childId) return;
    router.push(`/child-edit?childId=${encodeURIComponent(childId)}`);
  };

  const openDeleteModal = () => {
    if (!child) return;
    setDeleteTarget(child);
  };

  const closeDeleteModal = () => {
    setDeleteTarget(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    try {
      await deleteChildApi(Number(deleteTarget.id));
      toast.success(`${deleteTarget.name ?? '아이'} 정보가 삭제되었습니다.`);
    } catch {
      toast.error('삭제에 실패했습니다.');
    }
    setDeleteTarget(null);
    router.push("/mypage");
  };

  if (!child) {
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
            아이 정보
          </h1>
        </header>

        <section className="flex min-h-0 flex-1 flex-col rounded-3xl bg-white p-5 shadow-xl dark:bg-slate-900 dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
          <div className="flex min-h-[320px] items-center justify-center">
            <p className="text-[15px] font-bold text-[#475569] dark:text-slate-300">
              해당 아이 정보를 찾을 수 없습니다.
            </p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <>
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
            아이 정보
          </h1>
        </header>

        <section className="flex min-h-0 flex-1 flex-col rounded-3xl bg-white p-5 shadow-xl dark:bg-slate-900 dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
          <div className="mb-4">
            <h2 className="text-[18px] font-black text-[#475569] dark:text-slate-100">
              {child.name ?? "등록된 정보 없음"}
            </h2>
            <p className="mt-1 text-[13px] font-medium text-[#94A3B8] dark:text-slate-400">
              등록된 아이 정보
            </p>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto pr-1">
            <div className="rounded-2xl border border-[rgba(82,183,136,0.15)] bg-[rgba(255,255,255,0.85)] px-4 dark:border-slate-700 dark:bg-slate-800/80">
              <InfoRow label="이름" value={child.name ?? ""} />
              <InfoRow label="생년월일" value={child.birthdate ?? ""} />
              <InfoRow label="성별" value={normalizeGender(child.gender)} />
              <InfoRow
                label="키 / 몸무게"
                value={`${child.height ?? "-"}cm / ${child.weight ?? "-"}kg`}
              />
              <InfoRow
                label="알레르기"
                value={formatTextField(child.allergies)}
              />
              <InfoRow
                label="과거 병력 / 지병"
                value={formatTextField(
                  child.medicalHistory ?? child.medical_history
                )}
                multiline
              />
            </div>
          </div>

          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={handleEdit}
              className="flex-1 rounded-2xl bg-[rgba(82,183,136,0.12)] py-4 text-[15px] font-black text-[#52B788] shadow-lg transition-transform active:scale-[0.98] dark:bg-[rgba(82,183,136,0.18)] dark:text-[#6EE7B7] dark:shadow-[0_6px_20px_rgba(0,0,0,0.25)]"
            >
              편집
            </button>

            <button
              type="button"
              onClick={openDeleteModal}
              className="flex-1 rounded-2xl border border-[rgba(239,68,68,0.25)] bg-white py-4 text-[15px] font-black text-[#EF4444] shadow-lg transition-transform active:scale-[0.98] dark:border-[rgba(239,68,68,0.35)] dark:bg-slate-800"
            >
              삭제
            </button>
          </div>
        </section>
      </main>

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(51,65,85,0.35)] px-5 dark:bg-black/60">
          <div className="w-full max-w-[340px] rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 dark:shadow-[0_12px_40px_rgba(0,0,0,0.45)]">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(82,183,136,0.12)] shadow-md dark:bg-slate-800">
              <Image
                src="/logo.png"
                alt="로고"
                width={40}
                height={40}
                className="h-10 w-10 object-contain"
              />
            </div>

            <h3 className="text-center text-[20px] font-black text-[#334155] dark:text-slate-100">
              아이 정보를 삭제할까요?
            </h3>

            <p className="mt-3 text-center text-[14px] leading-6 text-[#475569] dark:text-slate-300">
              <span className="font-black text-[#334155] dark:text-slate-100">
                {deleteTarget.name ?? "선택한 아이"}
              </span>{" "}
              정보를 삭제하면 목록에서 사라집니다.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={closeDeleteModal}
                className="flex-1 rounded-2xl border border-[rgba(82,183,136,0.35)] bg-white py-3 text-[14px] font-bold text-[#52B788] transition-transform active:scale-[0.98] dark:border-slate-600 dark:bg-slate-800 dark:text-[#6EE7B7]"
              >
                취소
              </button>

              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="flex-1 rounded-2xl bg-[#52B788] py-3 text-[14px] font-black text-white shadow-lg transition-transform active:scale-[0.98] dark:bg-[#52B788]"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function ChildDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-dvh items-center justify-center bg-[#F4FCFB]">
          <div className="w-10 h-10 rounded-full border-[3px] border-[#52B788] border-t-transparent animate-spin" />
        </div>
      }
    >
      <ChildDetailContent />
    </Suspense>
  );
}