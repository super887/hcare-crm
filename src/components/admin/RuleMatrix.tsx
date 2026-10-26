"use client";

import { useMemo, useState } from "react";
import { getRecommendedPrograms } from "@/lib/matching-engine";
import { useHcareStore } from "@/lib/store";
import { Card } from "./ui";

const WEIGHT_STYLE = ["", "bg-sky-100 text-sky-700", "bg-sky-200 text-sky-800", "bg-teal-200 text-teal-900", "bg-teal-400 text-white", "bg-teal-600 text-white"];

export function RuleMatrix() {
  const observations = useHcareStore((s) => s.observations);
  const programs = useHcareStore((s) => s.programs);
  const exercises = useHcareStore((s) => s.exercises);
  const rules = useHcareStore((s) => s.rules);
  const maps = useHcareStore((s) => s.programExerciseMaps);
  const setRule = useHcareStore((s) => s.setRule);

  const obsList = useMemo(() => observations.filter((o) => o.isActive).sort((a, b) => a.displayOrder - b.displayOrder), [observations]);
  const progList = useMemo(() => programs.filter((p) => p.isActive), [programs]);
  const [obsId, setObsId] = useState<string>(obsList[0]?.id ?? "");
  const current = obsList.find((o) => o.id === obsId) ?? obsList[0];

  const weightOf = (o: string, p: string) => rules.find((r) => r.observationId === o && r.programId === p);
  const preview = useMemo(
    () => (current ? getRecommendedPrograms([current.id], { observations, programs, exercises, rules, programExerciseMaps: maps }).recommendations : []),
    [current, observations, programs, exercises, rules, maps],
  );

  if (!current) return <p className="p-6 text-sm text-slate-400">활성화된 관찰 항목이 없습니다.</p>;

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-teal-50 p-3 text-xs text-teal-900">
        <b>사용법</b> · 왼쪽에서 관찰 항목을 고르고, 오른쪽에서 연결할 관리 프로그램의 <b>중요도(1~5)</b>를 클릭하세요. 0은 연결 해제입니다.
        변경 즉시 관리사 화면의 추천 결과에 반영됩니다.
      </div>

      <div className="grid gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
        <Card title="관찰 항목">
          <ul className="max-h-[560px] space-y-1 overflow-auto pr-1">
            {obsList.map((o) => {
              const n = rules.filter((r) => r.observationId === o.id).length;
              return (
                <li key={o.id}>
                  <button type="button" onClick={() => setObsId(o.id)} className={`w-full rounded-lg border px-3 py-2 text-left ${o.id === current.id ? "border-teal-500 bg-teal-50" : "border-slate-200 hover:bg-slate-50"}`}>
                    <div className="text-[10px] text-slate-400">{o.category}</div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-slate-800">{o.label.replace(/\s*\(.*\)/, "")}</span>
                      <span className={`shrink-0 rounded-full px-1.5 text-[10px] font-bold ${n ? "bg-teal-100 text-teal-700" : "bg-amber-100 text-amber-700"}`}>{n}</span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </Card>

        <div className="space-y-4">
          <Card title={`「${current.label.replace(/\s*\(.*\)/, "")}」 체크 시 추천할 프로그램`}>
            <ul className="space-y-2">
              {progList.map((p) => {
                const rule = weightOf(current.id, p.id);
                const w = rule?.priorityWeight ?? 0;
                return (
                  <li key={p.id} className={`rounded-lg border p-3 ${w ? "border-teal-300 bg-teal-50/40" : "border-slate-200"}`}>
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-slate-800">{p.title}</div>
                        <div className="truncate text-[11px] text-slate-500">{p.targetMuscles.join(" · ")}</div>
                      </div>
                      <div className="flex items-center gap-1" role="group" aria-label="중요도">
                        {[0, 1, 2, 3, 4, 5].map((n) => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => setRule(current.id, p.id, n === 0 ? null : n)}
                            className={`h-8 w-8 rounded-md text-xs font-bold transition-colors ${w === n ? (n === 0 ? "bg-slate-700 text-white" : WEIGHT_STYLE[n]) + " ring-2 ring-offset-1 ring-teal-400" : "bg-slate-100 text-slate-400 hover:bg-slate-200"}`}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                    </div>
                    {rule && (
                      <input
                        key={`${rule.id}-${rule.rationaleNote ?? ""}`}
                        defaultValue={rule.rationaleNote ?? ""}
                        onBlur={(e) => e.target.value !== (rule.rationaleNote ?? "") && setRule(current.id, p.id, rule.priorityWeight, e.target.value)}
                        placeholder="연결 이유 메모 (예: 회전 제한 시 견갑거근 단축 확인)"
                        className="mt-2 w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-teal-500"
                      />
                    )}
                  </li>
                );
              })}
            </ul>
          </Card>

          <Card title="미리보기 · 이 항목만 체크했을 때 관리사 화면 추천 순위">
            {preview.length === 0 ? (
              <p className="text-xs text-amber-700">연결된 프로그램이 없어 추천이 표시되지 않습니다.</p>
            ) : (
              <ol className="space-y-1 text-sm">
                {preview.map((r, i) => (
                  <li key={r.program.id} className="flex items-center gap-2"><span className="w-5 text-xs font-bold text-slate-400">{i + 1}</span><span className="flex-1 text-slate-800">{r.program.title}</span><span className="text-xs font-semibold text-teal-700">{r.matchScore}점</span></li>
                ))}
              </ol>
            )}
          </Card>
        </div>
      </div>

      <Card title="전체 연결 현황 (엑셀 보기) · 셀을 클릭하면 해당 항목으로 이동">
        <div className="overflow-auto">
          <table className="min-w-full border-separate border-spacing-0 text-[11px]">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 border-b border-slate-200 bg-white p-2 text-left">관찰 항목 \ 프로그램</th>
                {progList.map((p) => <th key={p.id} className="max-w-[90px] border-b border-slate-200 p-2 align-bottom font-semibold text-slate-600"><div className="line-clamp-3">{p.title}</div></th>)}
              </tr>
            </thead>
            <tbody>
              {obsList.map((o) => (
                <tr key={o.id} className={o.id === current.id ? "bg-teal-50/60" : ""}>
                  <td className="sticky left-0 z-10 whitespace-nowrap border-b border-slate-100 bg-inherit bg-white p-2 font-medium text-slate-700">{o.label.replace(/\s*\(.*\)/, "")}</td>
                  {progList.map((p) => {
                    const w = weightOf(o.id, p.id)?.priorityWeight ?? 0;
                    return (
                      <td key={p.id} className="border-b border-slate-100 p-1 text-center">
                        <button type="button" onClick={() => setObsId(o.id)} className={`h-6 w-8 rounded text-[11px] font-bold ${w ? WEIGHT_STYLE[w] : "text-slate-200"}`}>{w || "·"}</button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
