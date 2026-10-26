"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Info, RotateCcw, Settings, Smartphone, Stethoscope } from "lucide-react";
import { useHcareStore } from "@/lib/store";
import type { UserRole } from "@/types/hcare";

const TABS: { href: string; role: UserRole; label: string; sub: string; icon: React.ReactNode }[] = [
  { href: "/therapist", role: "therapist", label: "관리사 화면", sub: "PC·태블릿", icon: <Stethoscope size={15} /> },
  { href: "/admin", role: "admin", label: "관리자 설정", sub: "PC", icon: <Settings size={15} /> },
  { href: "/my", role: "client", label: "고객 모바일", sub: "스마트폰", icon: <Smartphone size={15} /> },
];

/** 발주자가 로그인 없이 세 가지 화면을 한 번에 체험할 수 있는 데모 전용 상단 바 */
export function DemoToolbar() {
  const pathname = usePathname();
  const setRole = useHcareStore((s) => s.setRole);
  const resetDemo = useHcareStore((s) => s.resetDemo);
  const [showInfo, setShowInfo] = useState(false);

  const onReset = () => {
    if (window.confirm("데모 데이터를 처음 상태로 되돌릴까요?\n(입력한 고객·회차 기록이 모두 초기화됩니다)")) {
      resetDemo();
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-900 text-slate-100">
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2">
        <Link href="/" className="flex items-center gap-2 text-sm font-bold tracking-tight">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-teal-500 text-xs text-white">H</span>
          <span>Hcare CRM</span>
          <span className="hidden text-xs font-normal text-slate-400 md:inline">1:1 맞춤형 바디케어·운동지도</span>
          <span className="rounded bg-teal-400/20 px-1.5 py-0.5 text-[10px] font-semibold text-teal-300">시연용 MVP</span>
        </Link>

        <nav className="flex items-center gap-1 rounded-lg bg-slate-800 p-0.5" aria-label="데모 화면 전환">
          {TABS.map((t) => {
            const active = pathname?.startsWith(t.href);
            return (
              <Link
                key={t.href}
                href={t.href}
                onClick={() => setRole(t.role)}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  active ? "bg-teal-600 text-white shadow-sm" : "text-slate-300 hover:bg-slate-700 hover:text-white"
                }`}
              >
                {t.icon}
                {t.label}
                <span className="hidden text-[10px] opacity-70 sm:inline">{t.sub}</span>
              </Link>
            );
          })}
        </nav>

        <div className="relative ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowInfo((v) => !v)}
            className="flex items-center gap-1 rounded-md border border-slate-700 px-2.5 py-1.5 text-xs text-slate-300 hover:bg-slate-800"
          >
            <Info size={13} /> 예시 데이터 안내
          </button>
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1 rounded-md border border-slate-700 px-2.5 py-1.5 text-xs text-slate-300 hover:bg-slate-800"
          >
            <RotateCcw size={13} /> 데모 초기화
          </button>
          {showInfo && (
            <div className="absolute right-0 top-full mt-2 w-80 rounded-lg border border-slate-700 bg-slate-800 p-3 text-xs leading-relaxed text-slate-200 shadow-xl">
              <p className="mb-1 font-semibold text-amber-300">시연용 예시 데이터입니다</p>
              화면의 고객·근육·관리 프로그램·홈운동은 모두 가상의 예시이며 의학적 기준이 아닙니다. 실제 서비스에서는 관리자 화면에서
              대표님의 임상 기준으로 직접 입력·수정하실 수 있습니다. 이 데모의 입력 내용은 브라우저에만 저장됩니다.
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
