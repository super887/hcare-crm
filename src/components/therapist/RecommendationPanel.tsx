"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, ChevronDown, Dumbbell, Lock, Target } from "lucide-react";
import { BodyMap } from "@/components/body-map";
import type { RecommendationResult } from "@/types/hcare";

interface Props {
  result: RecommendationResult;
  checkedCount: number;
  selectedProgramIds: string[];
  onToggleProgram: (programId: string) => void;
}

const InternalBadge = () => (
  <span className="inline-flex items-center gap-1 rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-bold text-indigo-700 ring-1 ring-indigo-200">
    <Lock size={9} /> 내부용 · 고객 비노출
  </span>
);

export function RecommendationPanel({ result, checkedCount, selectedProgramIds, onToggleProgram }: Props) {
  const { recommendations, focusMuscles } = result;
  const [openId, setOpenId] = useState<string | null>(null);
  const selected = useMemo(() => new Set(selectedProgramIds), [selectedProgramIds]);
  const maxScore = recommendations[0]?.matchScore ?? 1;

  // 관리사가 프로그램을 선택했다면 그 근육, 아니면 상위 3개 후보의 근육을 바디맵에 점등
  const highlighted = useMemo(() => {
    const source = selectedProgramIds.length
      ? recommendations.filter((r) => selected.has(r.program.id))
      : recommendations.slice(0, 3);
    return [...new Set(source.flatMap((r) => r.program.targetMuscles))];
  }, [recommendations, selected, selectedProgramIds.length]);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-sm font-bold text-slate-800">
        <span className="mr-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-teal-600 text-[11px] text-white">2</span>
        추천 근육 · 관리 프로그램 후보
        <span className="ml-2 inline-flex items-center gap-1 align-middle"><InternalBadge /></span>
      </h3>

      {checkedCount === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 py-8 text-center">
          <BodyMap activeMuscles={[]} size="sm" showControls={false} className="opacity-60" />
          <p className="text-sm text-slate-500">왼쪽에서 관찰 항목을 체크하면<br />관련 근육과 관리 프로그램 후보가 여기에 표시됩니다.</p>
        </div>
      ) : recommendations.length === 0 ? (
        <p className="rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
          선택한 항목과 연결된 프로그램이 없습니다. 관리자 화면의 &lsquo;연결 기준&rsquo;에서 추가할 수 있습니다.
        </p>
      ) : (
        <>
          <div className="mb-3 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
            관찰 항목 <b className="text-slate-900">{checkedCount}개</b> 기준 · 중점 타겟 근육:
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {focusMuscles.slice(0, 6).map((m, i) => (
                <span
                  key={m.muscle}
                  className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${i < 3 ? "bg-rose-100 text-rose-700 ring-1 ring-rose-200" : "bg-white text-slate-600 ring-1 ring-slate-200"}`}
                >
                  {m.muscle}
                </span>
              ))}
            </div>
          </div>

          <div className="mb-4 flex flex-col items-center gap-1">
            <BodyMap activeMuscles={highlighted} size="md" initialView="back" />
            <p className="text-[11px] text-slate-400">
              {selectedProgramIds.length ? "선택한 프로그램의 타겟 근육" : "상위 3개 후보의 타겟 근육"}이 붉게 표시됩니다
            </p>
          </div>

          <ul className="space-y-2.5">
            {recommendations.map((r, idx) => {
              const on = selected.has(r.program.id);
              const open = openId === r.program.id;
              return (
                <li key={r.program.id} className={`rounded-xl border-2 transition-colors ${on ? "border-teal-500 bg-teal-50/40" : "border-slate-200"}`}>
                  <div className="flex items-start gap-3 p-3">
                    <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${idx === 0 ? "bg-amber-400 text-white" : "bg-slate-100 text-slate-500"}`}>
                      {idx + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900">{r.program.title}</h4>
                        <span className="text-[11px] text-slate-400">{r.program.durationMinutes}분</span>
                      </div>
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                          <div className="h-full rounded-full bg-teal-500" style={{ width: `${Math.round((r.matchScore / maxScore) * 100)}%` }} />
                        </div>
                        <span className="text-[11px] font-semibold text-teal-700">일치도 {r.matchScore}점</span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {r.matchedObservations.map((m) => (
                          <span key={m.observation.id} className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] text-emerald-700 ring-1 ring-emerald-100">
                            {m.observation.label.replace(/\s*\(.*\)/, "")} · {m.weight}
                          </span>
                        ))}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        <Target size={12} className="mt-0.5 text-rose-500" />
                        {r.program.targetMuscles.map((m) => (
                          <span key={m} className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-medium text-rose-700">{m}</span>
                        ))}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onToggleProgram(r.program.id)}
                      className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${on ? "bg-teal-600 text-white" : "border border-slate-300 text-slate-600 hover:bg-slate-50"}`}
                    >
                      {on ? "✓ 적용" : "이번 회차 적용"}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setOpenId(open ? null : r.program.id)}
                    className="flex w-full items-center justify-center gap-1 border-t border-slate-100 py-1.5 text-[11px] text-slate-500 hover:bg-slate-50"
                  >
                    상세 보기 (수기 관리 · 주의사항 · 홈운동) <ChevronDown size={12} className={open ? "rotate-180" : ""} />
                  </button>

                  {open && (
                    <div className="space-y-3 border-t border-slate-100 bg-white p-3 text-xs leading-relaxed text-slate-700">
                      <div>
                        <div className="mb-1 flex items-center gap-2 font-bold text-slate-900">수기 관리 방법 <InternalBadge /></div>
                        <p className="whitespace-pre-line rounded-md bg-indigo-50/60 p-2">{r.program.manualTherapyGuide}</p>
                      </div>
                      <div>
                        <div className="mb-1 flex items-center gap-1.5 font-bold text-amber-800"><AlertTriangle size={12} /> 주의사항 <InternalBadge /></div>
                        <p className="rounded-md bg-amber-50 p-2 text-amber-900">{r.program.precautions}</p>
                      </div>
                      {r.matchedObservations.some((m) => m.rationaleNote) && (
                        <div>
                          <div className="mb-1 font-bold text-slate-900">연결 근거</div>
                          <ul className="list-disc space-y-0.5 pl-4 text-slate-600">
                            {r.matchedObservations.filter((m) => m.rationaleNote).map((m) => (
                              <li key={m.observation.id}><b>{m.observation.label.replace(/\s*\(.*\)/, "")}</b>: {m.rationaleNote}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <div>
                        <div className="mb-1 flex items-center gap-1.5 font-bold text-slate-900"><Dumbbell size={12} /> 연결된 홈운동</div>
                        {r.recommendedExercises.length === 0 ? (
                          <p className="text-slate-400">연결된 홈운동이 없습니다.</p>
                        ) : (
                          <ul className="space-y-1">
                            {r.recommendedExercises.map((e) => (
                              <li key={e.id} className="rounded-md bg-slate-50 p-2">
                                <b>{e.title}</b> <span className="text-slate-500">· {e.prescriptionDefault}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </>
      )}
    </section>
  );
}
