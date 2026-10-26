"use client";

import { Check, Minus, ShieldCheck } from "lucide-react";
import { useHcareStore } from "@/lib/store";
import { Card } from "./ui";

const PERMS: { feature: string; admin: boolean; therapist: boolean; client: boolean | "own" }[] = [
  { feature: "고객 등록·상담 기록·회차 이력 조회", admin: true, therapist: true, client: "own" },
  { feature: "관찰 체크 → 근육·프로그램 후보 조회", admin: true, therapist: true, client: false },
  { feature: "수기 관리 방법·주의사항 조회 (내부 자료)", admin: true, therapist: true, client: false },
  { feature: "내부 임상 메모 조회", admin: true, therapist: true, client: false },
  { feature: "관찰 항목·프로그램·홈운동 자료 등록/수정", admin: true, therapist: false, client: false },
  { feature: "연결 기준(체크 항목 ↔ 프로그램) 관리", admin: true, therapist: false, client: false },
  { feature: "계정·권한 관리", admin: true, therapist: false, client: false },
  { feature: "본인 패키지·방문 이력 조회", admin: true, therapist: true, client: "own" },
  { feature: "배정된 홈운동 확인·수행 체크", admin: true, therapist: true, client: "own" },
];

const Mark = ({ v }: { v: boolean | "own" }) =>
  v === "own" ? <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-bold text-sky-700">본인 것만</span> : v ? <Check size={16} className="mx-auto text-emerald-600" /> : <Minus size={16} className="mx-auto text-slate-300" />;

export function AccountsTab() {
  const clients = useHcareStore((s) => s.clients);

  return (
    <div className="space-y-4">
      <Card title="역할별 접근 권한">
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs text-slate-500">
                <th className="py-2 text-left">기능</th>
                <th className="w-24 py-2">관리자</th>
                <th className="w-24 py-2">관리사</th>
                <th className="w-28 py-2">고객</th>
              </tr>
            </thead>
            <tbody>
              {PERMS.map((p) => (
                <tr key={p.feature} className="border-b border-slate-100">
                  <td className="py-2 pr-2 text-slate-700">{p.feature}</td>
                  <td className="py-2 text-center"><Mark v={p.admin} /></td>
                  <td className="py-2 text-center"><Mark v={p.therapist} /></td>
                  <td className="py-2 text-center"><Mark v={p.client} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 flex gap-2 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
          <ShieldCheck size={16} className="mt-0.5 shrink-0 text-teal-600" />
          <span>정식 서비스에서는 로그인(Supabase Auth)과 DB 단 접근 제어(RLS)로 위 권한이 강제됩니다. 고객은 DB 수준에서도 타인의 정보와 내부 자료를 조회할 수 없습니다. 이 데모에서는 시연 편의를 위해 상단 바로 화면을 전환합니다.</span>
        </p>
      </Card>

      <Card title={`계정 목록 (고객 ${clients.length}명)`}>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-slate-200 text-left text-xs text-slate-500"><th className="py-2">이름</th><th>역할</th><th>연락처</th><th>개인정보 동의</th><th>담당 관리사</th></tr></thead>
            <tbody>
              <tr className="border-b border-slate-100"><td className="py-2 font-semibold">대표 원장</td><td><span className="rounded bg-violet-50 px-1.5 py-0.5 text-[11px] font-bold text-violet-700">관리자</span></td><td className="text-slate-500">-</td><td className="text-slate-400">-</td><td>-</td></tr>
              <tr className="border-b border-slate-100"><td className="py-2 font-semibold">한지민 관리사</td><td><span className="rounded bg-indigo-50 px-1.5 py-0.5 text-[11px] font-bold text-indigo-700">관리사</span></td><td className="text-slate-500">-</td><td className="text-slate-400">-</td><td>-</td></tr>
              {clients.map((c) => (
                <tr key={c.id} className="border-b border-slate-100">
                  <td className="py-2 font-semibold">{c.name}</td>
                  <td><span className="rounded bg-teal-50 px-1.5 py-0.5 text-[11px] font-bold text-teal-700">고객</span></td>
                  <td className="text-slate-500">{c.phone}</td>
                  <td>{c.privacyConsent ? <span className="text-emerald-600">동의 {c.privacyConsentAt?.slice(0, 10)}</span> : <span className="text-rose-500">미동의</span>}</td>
                  <td className="text-slate-500">한지민 관리사</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
