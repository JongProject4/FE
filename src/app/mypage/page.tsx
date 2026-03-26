import styles from "./page.module.css";
import Image from "next/image";
import Link from "next/link";
import { mockUser } from "../mocks/user";
import { mockChildren } from "../mocks/child";

export default function MyPage() {
  return (
    <main className="flex h-dvh flex-col overflow-hidden bg-[#F4FCFB] max-w-[430px] mx-auto px-5 pt-6 pb-6">
      <header className="mb-6 flex items-center gap-3">
        <button className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFFFFF] text-[#4A90D9] shadow-md active:scale-95 transition-transform">
          ←
        </button>
        <h1 className="text-[24px] font-black tracking-tight text-[#4A90D9]">
          마이페이지
        </h1>
      </header>

      <section className="mb-5 rounded-3xl bg-[#FFFFFF] p-5 shadow-xl">
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
            <p className="text-[20px] font-black text-[#4A90D9]">
              {mockUser.name}
            </p>

            <p className="mt-2 text-[13px] font-semibold text-[#4A90D9]">
              전화번호 :{" "}
              <span className="font-bold text-[#52B788]">
                {mockUser.phoneNumber}
              </span>
            </p>
          </div>
        </div>
      </section>

      <section className="flex min-h-0 flex-1 flex-col rounded-3xl bg-[#FFFFFF] p-5 shadow-xl">
        <div className="mb-4">
          <h2 className="text-[18px] font-black text-[#4A90D9]">내 아이</h2>

          <Link
            href="/child-setup"
            className="mt-3 inline-flex rounded-2xl bg-gradient-to-r from-[#00C9FF] to-[#52B788] px-4 py-3 text-[14px] font-black text-[#FFFFFF] shadow-lg active:scale-[0.98] transition-transform"
          >
            아이 추가
          </Link>
        </div>

        <div className={`${styles.childListScroll} flex-1 min-h-0 space-y-3 overflow-y-auto pr-1`}>
          {mockChildren.map((child) => (
            <div
              key={child.id}
              className="rounded-2xl border border-[rgba(0,201,255,0.15)] bg-[rgba(255,255,255,0.8)] p-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[16px] font-bold text-[#4A90D9]">
                    {child.name}
                  </p>
                </div>

                <div className="flex gap-2 self-end sm:self-auto">
                  <button className="rounded-xl border border-[rgba(82,183,136,0.35)] bg-[#FFFFFF] px-3 py-2 text-[13px] font-bold text-[#52B788] active:scale-[0.98] transition-transform">
                    편집
                  </button>
                  <button className="rounded-xl bg-[#4A90D9] px-3 py-2 text-[13px] font-bold text-[#FFFFFF] active:scale-[0.98] transition-transform">
                    삭제
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button className="mt-4 w-full rounded-2xl bg-[rgba(82,183,136,0.12)] py-4 text-[15px] font-black text-[#52B788] active:scale-[0.98] transition-transform">
          로그아웃
        </button>
      </section>
    </main>
  );
}