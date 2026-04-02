'use client'
import { useState } from "react";
import styles from "./page.module.css";
import Image from "next/image";
import Link from "next/link";
import { mockUser } from "../mocks/user";
import { mockChildren } from "../mocks/child";
import { BottomNav } from "@/components/layout/BottomNav";

type Child = {
  id: number;
  name: string;
};

export default function MyPage() {
  const [children, setChildren] = useState<Child[]>(mockChildren);
  const [deleteTarget, setDeleteTarget] = useState<Child | null>(null);

  const openDeleteModal = (child: Child) => {
    setDeleteTarget(child);
  };

  const closeDeleteModal = () => {
    setDeleteTarget(null);
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;

    setChildren((prev) =>
      prev.filter((child) => child.id !== deleteTarget.id)
    );
    setDeleteTarget(null);
  };

  return (
    <>
      <main className="mx-auto flex h-dvh max-w-[430px] flex-col overflow-hidden bg-[#F4FCFB] px-5 pt-6 pb-6 dark:bg-slate-950">
        <header className="mb-6 flex items-center gap-3">
          <Link
            href="/chat"
            aria-label="메인페이지로 이동"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#52B788] shadow-md transition-transform active:scale-95 dark:bg-slate-800 dark:text-[#52B788] dark:shadow-[0_4px_20px_rgba(0,0,0,0.35)]"
          >
            <HomeIcon />
          </Link>

          <h1 className="text-[24px] font-black tracking-tight text-[#334155] dark:text-slate-100">
            마이페이지
          </h1>
        </header>

        <section className="mb-5 rounded-3xl bg-white p-5 shadow-xl dark:bg-slate-900 dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
          <div className="flex items-start gap-4">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full shadow-lg">
              <Image
                src="/default-profile.png"
                alt="기본 프로필 이미지"
                width={80}
                height={80}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="flex-1">
              <p className="text-[20px] font-black text-[#475569] dark:text-slate-100">
                {mockUser.name}
              </p>

              <p className="mt-2 text-[13px] font-semibold text-[#475569] dark:text-slate-300">
                전화번호 :{" "}
                <span className="font-bold text-[#526277] dark:text-slate-200">
                  {mockUser.phoneNumber}
                </span>
              </p>
            </div>
          </div>
        </section>

        <section className="flex min-h-0 flex-1 flex-col rounded-3xl bg-white p-5 shadow-xl dark:bg-slate-900 dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
          <div className="mb-4">
            <h2 className="text-[18px] font-black text-[#475569] dark:text-slate-100">
              내 아이
            </h2>

            <Link
              href="/child-setup"
              className="mt-3 inline-flex rounded-2xl bg-[rgba(82,183,136,0.12)] px-4 py-3 text-[14px] font-black text-[#52B788] shadow-lg transition-transform active:scale-[0.98] dark:bg-[rgba(82,183,136,0.18)] dark:text-[#6EE7B7] dark:shadow-[0_6px_20px_rgba(0,0,0,0.25)]"
            >
              +
            </Link>
          </div>

          <div className={`${styles.childListScroll} min-h-0 flex-1 space-y-3 overflow-y-auto pr-1`}>
            {children.map((child) => (
              <div
                key={child.id}
                className="rounded-2xl border border-[rgba(0,201,255,0.15)] bg-[rgba(255,255,255,0.8)] p-4 dark:border-slate-700 dark:bg-slate-800/80"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[16px] font-bold text-[#526277] dark:text-slate-100">
                      {child.name}
                    </p>
                  </div>

                  <div className="flex gap-2 self-end sm:self-auto">
                    <Link
                      href={`/child-edit?childId=${child.id}`}
                      aria-label={`${child.name} 편집`}
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-[rgba(82,183,136,0.35)] bg-white text-[#52B788] transition-transform active:scale-[0.98] dark:border-slate-600 dark:bg-slate-800 dark:text-[#6EE7B7]"
                    >
                      <EditIcon />
                    </Link>

                    <button
                      aria-label={`${child.name} 삭제`}
                      onClick={() => openDeleteModal(child)}
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#52B788] text-white transition-transform active:scale-[0.98] dark:bg-[#52B788] dark:text-white"
                    >
                      <DeleteIcon />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {children.length === 0 && (
              <div className="rounded-2xl border border-dashed border-[rgba(0,201,255,0.25)] bg-[rgba(0,201,255,0.04)] px-4 py-8 text-center dark:border-slate-700 dark:bg-slate-800">
                <p className="text-[14px] font-semibold text-[#4A90D9] dark:text-slate-300">
                  등록된 아이가 없습니다.
                </p>
              </div>
            )}
          </div>

          <button className="mt-4 w-full rounded-2xl bg-[rgba(82,183,136,0.12)] py-4 text-[15px] font-black text-[#52B788] transition-transform active:scale-[0.98] dark:bg-[rgba(82,183,136,0.18)] dark:text-[#6EE7B7]">
            로그아웃
          </button>
        </section>
      </main>
      <BottomNav />

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(26,35,64,0.35)] px-5 dark:bg-black/60">
          <div className="w-full max-w-[340px] rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 dark:shadow-[0_12px_40px_rgba(0,0,0,0.45)]">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(0,201,255,0.10)] shadow-md dark:bg-slate-800">
              <Image
                src="/logo.png"
                alt="로고"
                width={40}
                height={40}
                className="h-10 w-10 object-contain"
              />
            </div>

            <h3 className="text-center text-[20px] font-black text-[#4A90D9] dark:text-slate-100">
              아이 정보를 삭제할까요?
            </h3>

            <p className="mt-3 text-center text-[14px] leading-6 text-[#4A90D9] dark:text-slate-300">
              <span className="font-black dark:text-slate-100">{deleteTarget.name}</span> 정보를 삭제하면
              목록에서 사라집니다.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                onClick={closeDeleteModal}
                className="flex-1 rounded-2xl border border-[rgba(82,183,136,0.35)] bg-white py-3 text-[14px] font-bold text-[#52B788] transition-transform active:scale-[0.98] dark:border-slate-600 dark:bg-slate-800 dark:text-[#6EE7B7]"
              >
                취소
              </button>

              <button
                onClick={handleDeleteConfirm}
                className="flex-1 rounded-2xl bg-gradient-to-r from-[#4A90D9] to-[#00C9FF] py-3 text-[14px] font-black text-white shadow-lg transition-transform active:scale-[0.98]"
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

function HomeIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V20h14V9.5" />
      <path d="M9 20v-6h6v6" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 20h9" />
      <path d="m16.5 3.5 4 4L7 21l-4 1 1-4L16.5 3.5z" />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}