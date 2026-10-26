"use client";

import { useState } from "react";
import { Dumbbell, Link2, ListChecks, ShieldCheck, Stethoscope } from "lucide-react";
import { useHydrated } from "@/lib/store";
import { AccountsTab } from "@/components/admin/AccountsTab";
import { ExerciseManager } from "@/components/admin/ExerciseManager";
import { ObservationManager } from "@/components/admin/ObservationManager";
import { ProgramManager } from "@/components/admin/ProgramManager";
import { RuleMatrix } from "@/components/admin/RuleMatrix";

const TABS = [
  { key: "rules", label: "연결 기준", icon: Link2, el: <RuleMatrix /> },
  { key: "obs", label: "관찰 체크리스트", icon: ListChecks, el: <ObservationManager /> },
  { key: "prog", label: "관리 프로그램·근육", icon: Stethoscope, el: <ProgramManager /> },
  { key: "ex", label: "홈운동 자료", icon: Dumbbell, el: <ExerciseManager /> },
  { key: "acc", label: "계정·권한", icon: ShieldCheck, el: <AccountsTab /> },
] as const;

export default function AdminPage() {
  const hydrated = useHydrated();
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("rules");
  if (!hydrated) return <div className="p-10 text-center text-sm text-slate-400">불러오는 중…</div>;

  return (
    <main className="mx-auto max-w-[1400px] p-4">
      <div className="mb-4">
        <h1 className="text-lg font-bold text-slate-900">관리자 설정</h1>
        <p className="text-xs text-slate-500">관찰 항목, 관리 프로그램, 연결 기준을 개발자 없이 직접 추가·수정합니다. 수정 즉시 관리사 화면에 반영됩니다.</p>
      </div>
      <div className="mb-4 flex flex-wrap gap-1 border-b border-slate-200">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button key={key} type="button" onClick={() => setTab(key)} className={`-mb-px flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-semibold ${tab === key ? "border-teal-600 text-teal-700" : "border-transparent text-slate-500 hover:text-slate-700"}`}>
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>
      {TABS.find((t) => t.key === tab)?.el}
    </main>
  );
}
