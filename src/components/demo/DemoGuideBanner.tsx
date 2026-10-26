"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, ChevronDown, ChevronUp, CheckCircle, Stethoscope, Smartphone, Settings } from "lucide-react";
import { useHcareStore } from "@/lib/store";

export function DemoGuideBanner() {
  const [isOpen, setIsOpen] = useState(true);
  const setRole = useHcareStore((s) => s.setRole);

  return (
    <aside aria-label="데모 시연 가이드" className="rounded-xl border border-teal-200 bg-gradient-to-r from-teal-50 via-emerald-50 to-teal-50 p-3.5 text-slate-800 shadow-xs mb-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-600 text-white shadow-xs">
            <Sparkles size={13} />
          </span>
          <span className="text-xs font-bold text-teal-950 sm:text-sm">
            대표님 & 심사위원을 위한 30초 핵심 시연 시나리오
          </span>
          <span className="hidden rounded-full bg-teal-200/70 px-2 py-0.5 text-[10px] font-bold text-teal-800 sm:inline">
            창업지원사업 맞춤형
          </span>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-teal-800 hover:bg-teal-100/60"
        >
          {isOpen ? (
            <>
              <span>가이드 접기</span>
              <ChevronUp size={14} />
            </>
          ) : (
            <>
              <span>가이드 펼치기</span>
              <ChevronDown size={14} />
            </>
          )}
        </button>
      </div>

      {isOpen && (
        <div className="mt-3 grid gap-2.5 pt-2 border-t border-teal-200/60 sm:grid-cols-3">
          {/* Step 1 */}
          <div className="rounded-lg bg-white/90 p-2.5 border border-teal-100 shadow-2xs">
            <div className="flex items-center gap-1.5 text-xs font-bold text-teal-900 mb-1">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-teal-600 text-[10px] text-white">1</span>
              <span>[관리사] 관찰 체크 & 3D 근육 맵</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              아래 <b>&apos;경추·어깨&apos;</b>에서 <b>&apos;고개 좌우 회전 시 통증&apos;</b>을 체크해 보세요. 우측 <b>3D 인체 바디맵(360° 회전·줌인/아웃 지원)</b>에 타겟 근육이 붉게 점등되며 맞춤 프로그램이 추천됩니다.
            </p>
          </div>

          {/* Step 2 */}
          <div className="rounded-lg bg-white/90 p-2.5 border border-teal-100 shadow-2xs">
            <div className="flex items-center gap-1.5 text-xs font-bold text-teal-900 mb-1">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-teal-600 text-[10px] text-white">2</span>
              <span>[관리사] 홈운동 배정 & 저장</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              추천 프로그램 카드에서 <b>&apos;이번 회차 적용&apos;</b>을 누르고 맨 아래 <b>[회차 기록 저장]</b> 버튼을 누르면 잔여 회차가 차감되고 홈운동이 고객에게 배정됩니다.
            </p>
          </div>

          {/* Step 3 */}
          <div className="rounded-lg bg-white/90 p-2.5 border border-teal-100 shadow-2xs">
            <div className="flex items-center gap-1.5 text-xs font-bold text-teal-900 mb-1">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-teal-600 text-[10px] text-white">3</span>
              <span>[고객] PC 웹 & 모바일 운동 체크</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              상단 탭에서 <b>[고객 PC 화면]</b> 또는 <b>[고객 모바일]</b>로 전환하면 3D 케어 부위 리포트, 홈운동 영상 재생, <b>[오늘 운동 완료 체크]</b>가 즉시 연동됩니다.
            </p>
            <div className="mt-1.5 pt-1 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] text-slate-400">대표님 직접 관리:</span>
              <Link
                href="/admin"
                onClick={() => setRole("admin")}
                className="inline-flex items-center gap-0.5 text-[10px] font-bold text-teal-700 hover:underline"
              >
                <span>[관리자 설정] 바로가기</span>
                <ArrowRight size={10} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
