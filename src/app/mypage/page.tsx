'use client'
import { useState, useEffect } from "react";
import styles from "./page.module.css";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/layout/BottomNav";
import {
  getMe,
  getChildren as fetchChildrenApi,
  deleteChild as deleteChildApi,
  removeAccessToken,
  type CurrentUser,
  type ChildResponse,
} from '@/lib/api';
import toast from 'react-hot-toast';
import { useAppStore } from '@/lib/store';

type Child = {
  id: number;
  name: string;
};

export default function MyPage() {
  const router = useRouter();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<Child | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // 백엔드에서 사용자 정보 및 아이 목록 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        const [userData, childrenData] = await Promise.all([
          getMe(),
          fetchChildrenApi(),
        ]);
        setUser(userData);
        setChildren(childrenData.map((c: ChildResponse) => ({ id: c.id, name: c.name })));
      } catch {
        console.warn('백엔드 데이터 로드 실패');
      } finally {
        setLoadingUser(false);
      }
    };
    loadData();
  }, []);

  const openDeleteModal = (child: Child) => {
    setDeleteTarget(child);
  };

  const closeDeleteModal = () => {
    setDeleteTarget(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    try {
      await deleteChildApi(deleteTarget.id);
      setChildren((prev) =>
        prev.filter((child) => child.id !== deleteTarget.id)
      );
      toast.success(`${deleteTarget.name} 정보가 삭제되었습니다.`);
    } catch {
      toast.error('삭제에 실패했습니다.');
    }
    setDeleteTarget(null);
  };

  const handleLogout = () => {
    removeAccessToken();
    useAppStore.persist.clearStorage(); // 기존 로컬스토리지 정리
    useAppStore.getState().clearMessages();
    useAppStore.getState().setChatSessions([]);
    useAppStore.getState().setHistoryLoaded(false);
    useAppStore.getState().setConsultationId(null);
    useAppStore.getState().setChildren([]);
    router.push('/login');
  };

  return (
    <>
      <div
        style={{ backgroundColor: '#F4FCFB', color: '#334155' }}
        className="mx-auto flex h-dvh max-w-[430px] flex-col overflow-hidden"
      >
        <main className="flex-1 overflow-y-auto px-5 pt-6 pb-6">
          <header className="mb-6 flex shrink-0 items-center gap-3">
            <Link
              href="/chat"
              aria-label="메인페이지로 이동"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#52B788] shadow-md transition-transform active:scale-95"
            >
              <HomeIcon />
            </Link>

            <h1 className="text-[24px] font-black tracking-tight text-[#334155]">
              마이페이지
            </h1>
          </header>

          <section className="mb-5 shrink-0 rounded-3xl bg-white p-5 shadow-xl">
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
                <p className="text-[20px] font-black text-[#475569]">
                  {loadingUser ? '...' : (user?.name ?? '사용자')}
                </p>

                <p className="mt-2 text-[13px] font-semibold text-[#475569]">
                  전화번호 :{" "}
                  <span className="font-bold text-[#526277]">
                    {loadingUser ? '...' : (user?.phoneNumber ?? '미등록')}
                  </span>
                </p>
              </div>
            </div>
          </section>

          <section className="flex shrink-0 flex-col rounded-3xl bg-white p-5 shadow-xl">
            <div className="mb-4">
              <h2 className="text-[18px] font-black text-[#475569]">
                내 아이
              </h2>

              <Link
                href="/child-setup"
                className="mt-3 inline-flex rounded-2xl bg-[rgba(82,183,136,0.12)] px-4 py-3 text-[14px] font-black text-[#52B788] shadow-lg transition-transform active:scale-[0.98]"
              >
                +
              </Link>
            </div>

            <div className={`${styles.childListScroll} space-y-3 pr-1`}>
              {children.map((child) => (
                <div
                  key={child.id}
                  className="rounded-2xl border border-[rgba(0,201,255,0.15)] bg-[rgba(255,255,255,0.8)] p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <Link
                      href={`/child?childId=${child.id}`}
                      className="block flex-1 rounded-xl outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-[#52B788]"
                    >
                      <p className="text-[16px] font-bold text-[#526277]">
                        {child.name}
                      </p>
                    </Link>

                    <div className="flex gap-2 self-end sm:self-auto">
                      <Link
                        href={`/child-edit?childId=${child.id}`}
                        aria-label={`${child.name} 편집`}
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-[rgba(82,183,136,0.35)] bg-white text-[#52B788] transition-transform active:scale-[0.98]"
                      >
                        <EditIcon />
                      </Link>

                      <button
                        aria-label={`${child.name} 삭제`}
                        onClick={() => openDeleteModal(child)}
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#52B788] text-white transition-transform active:scale-[0.98]"
                      >
                        <DeleteIcon />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {children.length === 0 && (
                <div className="rounded-2xl border border-dashed border-[rgba(0,201,255,0.25)] bg-[rgba(0,201,255,0.04)] px-4 py-8 text-center">
                  <p className="text-[14px] font-semibold text-[#4A90D9]">
                    등록된 아이가 없습니다.
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={handleLogout}
              className="mt-4 w-full rounded-2xl bg-[rgba(82,183,136,0.12)] py-4 text-[15px] font-black text-[#52B788] transition-transform active:scale-[0.98]">
              로그아웃
            </button>
          </section>
        </main>
        <BottomNav />
      </div>

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(51,65,85,0.35)] px-5">
          <div className="w-full max-w-[340px] rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(82,183,136,0.12)] shadow-md">
              <Image
                src="/logo.png"
                alt="로고"
                width={40}
                height={40}
                className="h-10 w-10 object-contain"
              />
            </div>

            <h3 className="text-center text-[20px] font-black text-[#334155]">
              아이 정보를 삭제할까요?
            </h3>

            <p className="mt-3 text-center text-[14px] leading-6 text-[#475569]">
              <span className="font-black text-[#334155]">
                {deleteTarget.name}
              </span>{" "}
              정보를 삭제하면 목록에서 사라집니다.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                onClick={closeDeleteModal}
                className="flex-1 rounded-2xl border border-[rgba(82,183,136,0.35)] bg-white py-3 text-[14px] font-bold text-[#52B788] transition-transform active:scale-[0.98]"
              >
                취소
              </button>

              <button
                onClick={handleDeleteConfirm}
                className="flex-1 rounded-2xl bg-[#52B788] py-3 text-[14px] font-black text-white shadow-lg transition-transform active:scale-[0.98]"
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
