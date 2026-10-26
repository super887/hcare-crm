"use client";

import { useMemo } from "react";
import { EyeOff, Eye, Save } from "lucide-react";
import type { HomeExercise, ProgramRecommendation } from "@/types/hcare";

export interface SessionFormValues {
  exerciseIds: string[];
  therapistPrivateNote: string;
  clientPublicNote: string;
  painBefore: string;
  painAfter: string;
}

interface Props {
  clientName: string;
  selectedRecommendations: ProgramRecommendation[];
  allExercises: HomeExercise[];
  values: SessionFormValues;
  onChange: (patch: Partial<SessionFormValues>) => void;
  onSave: () => void;
  canSave: boolean;
  disabledReason?: string;
}

const area = "w-full rounded-md border bg-white px-3 py-2 text-sm outline-none focus:ring-2";

export function SessionSaveForm({ clientName, selectedRecommendations, allExercises, values, onChange, onSave, canSave, disabledReason }: Props) {
  const recommendedIds = useMemo(
    () => new Set(selectedRecommendations.flatMap((r) => r.recommendedExercises.map((e) => e.id))),
    [selectedRecommendations],
  );
  const sorted = useMemo(
    () => [...allExercises].filter((e) => e.isActive).sort((a, b) => Number(recommendedIds.has(b.id)) - Number(recommendedIds.has(a.id))),
    [allExercises, recommendedIds],
  );
  const chosen = new Set(values.exerciseIds);

  const toggleExercise = (id: string) =>
    onChange({ exerciseIds: chosen.has(id) ? values.exerciseIds.filter((x) => x !== id) : [...values.exerciseIds, id] });

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-sm font-bold text-slate-800">
        <span className="mr-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-teal-600 text-[11px] text-white">3</span>
        최종 선택 · 홈운동 배정 · 기록 저장
      </h3>

      <div className="mb-4 rounded-lg bg-slate-50 p-3">
        <div className="mb-1 text-xs font-semibold text-slate-500">이번 회차 적용 프로그램</div>
        {selectedRecommendations.length === 0 ? (
          <p className="text-sm text-slate-400">위 후보 카드에서 &lsquo;이번 회차 적용&rsquo;을 눌러 선택하세요.</p>
        ) : (
          <ul className="flex flex-wrap gap-1.5">
            {selectedRecommendations.map((r) => (
              <li key={r.program.id} className="rounded-full bg-teal-600 px-3 py-1 text-xs font-semibold text-white">{r.program.title}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="mb-4">
        <div className="mb-1.5 text-xs font-semibold text-slate-500">{clientName}님께 배정할 홈운동 <span className="font-normal text-slate-400">(선택한 프로그램의 추천 운동이 자동 체크됩니다)</span></div>
        <ul className="grid gap-1.5 md:grid-cols-2">
          {sorted.map((e) => (
            <li key={e.id}>
              <label className={`flex cursor-pointer items-start gap-2 rounded-lg border px-3 py-2 text-xs ${chosen.has(e.id) ? "border-teal-500 bg-teal-50" : "border-slate-200 hover:bg-slate-50"}`}>
                <input type="checkbox" className="mt-0.5" checked={chosen.has(e.id)} onChange={() => toggleExercise(e.id)} />
                <span>
                  <b className="text-slate-800">{e.title}</b>
                  {recommendedIds.has(e.id) && <span className="ml-1.5 rounded bg-emerald-100 px-1 text-[10px] font-bold text-emerald-700">추천</span>}
                  <span className="block text-slate-500">{e.prescriptionDefault}</span>
                </span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 sm:max-w-sm">
        <label className="text-xs font-medium text-slate-600">
          관리 전 통증 (0~10)
          <input type="number" min={0} max={10} value={values.painBefore} onChange={(e) => onChange({ painBefore: e.target.value })} className={`${area} mt-1 border-slate-300 focus:ring-teal-200`} />
        </label>
        <label className="text-xs font-medium text-slate-600">
          관리 후 통증 (0~10)
          <input type="number" min={0} max={10} value={values.painAfter} onChange={(e) => onChange({ painAfter: e.target.value })} className={`${area} mt-1 border-slate-300 focus:ring-teal-200`} />
        </label>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="text-xs font-medium text-slate-600">
          <span className="mb-1 flex items-center gap-1.5 font-bold text-indigo-700"><EyeOff size={13} /> 내부 임상 메모 <span className="rounded bg-indigo-50 px-1.5 text-[10px]">고객 비공개</span></span>
          <textarea rows={4} value={values.therapistPrivateNote} onChange={(e) => onChange({ therapistPrivateNote: e.target.value })} placeholder="촉진 소견, 압통점, 다음 회차 참고 사항 등" className={`${area} border-indigo-200 bg-indigo-50/30 focus:ring-indigo-200`} />
        </label>
        <label className="text-xs font-medium text-slate-600">
          <span className="mb-1 flex items-center gap-1.5 font-bold text-teal-700"><Eye size={13} /> 고객 안내 코멘트 <span className="rounded bg-teal-50 px-1.5 text-[10px]">고객 화면 노출</span></span>
          <textarea rows={4} value={values.clientPublicNote} onChange={(e) => onChange({ clientPublicNote: e.target.value })} placeholder="오늘 관리 요약, 생활습관 조언 (고객이 읽는 문구)" className={`${area} border-teal-200 bg-teal-50/30 focus:ring-teal-200`} />
        </label>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-end gap-3">
        {!canSave && disabledReason && <span className="text-xs text-slate-400">{disabledReason}</span>}
        <button
          type="button"
          onClick={onSave}
          disabled={!canSave}
          className="flex items-center gap-2 rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm enabled:hover:bg-teal-700 disabled:opacity-40"
        >
          <Save size={16} /> 회차 기록 저장 및 고객 홈운동 발송
        </button>
      </div>
    </section>
  );
}
