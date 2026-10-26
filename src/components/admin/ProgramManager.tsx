"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { BodyMap } from "@/components/body-map";
import { useHcareStore } from "@/lib/store";
import { ActiveBadge, Card, Field, inputCls } from "./ui";

interface Form {
  id?: string;
  category: string;
  title: string;
  musclesText: string;
  manualTherapyGuide: string;
  precautions: string;
  clientSummaryTemplate: string;
  durationMinutes: number;
}
const blank: Form = { category: "상체/경추", title: "", musclesText: "", manualTherapyGuide: "", precautions: "", clientSummaryTemplate: "", durationMinutes: 50 };

export function ProgramManager() {
  const programs = useHcareStore((s) => s.programs);
  const exercises = useHcareStore((s) => s.exercises);
  const maps = useHcareStore((s) => s.programExerciseMaps);
  const upsert = useHcareStore((s) => s.upsertProgram);
  const toggleActive = useHcareStore((s) => s.toggleProgramActive);
  const toggleEx = useHcareStore((s) => s.toggleProgramExercise);
  const [form, setForm] = useState<Form>(blank);

  const muscles = useMemo(() => form.musclesText.split(/[,，、]/).map((m) => m.trim()).filter(Boolean), [form.musclesText]);
  const edit = (id: string) => {
    const p = programs.find((x) => x.id === id);
    if (!p) return;
    setForm({ id: p.id, category: p.category, title: p.title, musclesText: p.targetMuscles.join(", "), manualTherapyGuide: p.manualTherapyGuide, precautions: p.precautions, clientSummaryTemplate: p.clientSummaryTemplate, durationMinutes: p.durationMinutes });
  };

  const valid = form.title.trim() && muscles.length > 0 && form.manualTherapyGuide.trim();
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    const prev = programs.find((p) => p.id === form.id);
    upsert({
      id: form.id,
      category: form.category.trim() || "기타",
      title: form.title.trim(),
      targetMuscles: muscles,
      manualTherapyGuide: form.manualTherapyGuide,
      precautions: form.precautions,
      clientSummaryTemplate: form.clientSummaryTemplate,
      durationMinutes: form.durationMinutes || 50,
      isActive: prev?.isActive ?? true,
    });
    if (!form.id) setForm(blank);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
      <Card title={`관리 프로그램 (${programs.length})`} right={<button type="button" onClick={() => setForm(blank)} className="flex items-center gap-1 rounded-md bg-teal-600 px-2.5 py-1.5 text-xs font-semibold text-white"><Plus size={13} />새 프로그램</button>}>
        <ul className="space-y-1.5">
          {programs.map((p) => (
            <li key={p.id}>
              <button type="button" onClick={() => edit(p.id)} className={`w-full rounded-lg border px-3 py-2 text-left ${form.id === p.id ? "border-teal-500 bg-teal-50" : "border-slate-200 hover:bg-slate-50"} ${p.isActive ? "" : "opacity-50"}`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-slate-800">{p.title}</span>
                  <ActiveBadge active={p.isActive} />
                </div>
                <div className="mt-0.5 truncate text-[11px] text-slate-500">{p.targetMuscles.join(" · ")}</div>
              </button>
            </li>
          ))}
        </ul>
      </Card>

      <form onSubmit={submit} className="space-y-4">
        <Card title={form.id ? "프로그램 수정" : "새 관리 프로그램 등록"} right={form.id ? <button type="button" onClick={() => toggleActive(form.id!)} className="rounded border border-slate-200 px-2 py-1 text-[11px] text-slate-600 hover:bg-slate-50">{programs.find((p) => p.id === form.id)?.isActive ? "비활성화" : "활성화"}</button> : undefined}>
          <div className="grid gap-3 md:grid-cols-[1fr_1fr_100px]">
            <Field label="프로그램명"><input className={inputCls} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
            <Field label="분류"><input className={inputCls} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></Field>
            <Field label="소요(분)"><input type="number" min={10} className={inputCls} value={form.durationMinutes} onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })} /></Field>
          </div>
          <div className="mt-3 grid gap-4 md:grid-cols-[1fr_auto]">
            <div className="space-y-3">
              <Field label="대상 근육" hint="(쉼표로 구분 · 오른쪽 바디맵에서 위치 확인)">
                <input className={inputCls} value={form.musclesText} onChange={(e) => setForm({ ...form, musclesText: e.target.value })} placeholder="견갑거근, 상부승모근, 흉쇄유돌근" />
              </Field>
              <div className="flex flex-wrap gap-1">{muscles.map((m) => <span key={m} className="rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-medium text-rose-700">{m}</span>)}</div>
              <Field label="수기 관리 방법" hint="(관리사 전용 · 고객 비노출)"><textarea rows={5} className={inputCls} value={form.manualTherapyGuide} onChange={(e) => setForm({ ...form, manualTherapyGuide: e.target.value })} /></Field>
              <Field label="주의사항·금기" hint="(관리사 전용)"><textarea rows={3} className={inputCls} value={form.precautions} onChange={(e) => setForm({ ...form, precautions: e.target.value })} /></Field>
              <Field label="고객 안내 문구" hint="(고객 이력 화면에 노출)"><textarea rows={2} className={inputCls} value={form.clientSummaryTemplate} onChange={(e) => setForm({ ...form, clientSummaryTemplate: e.target.value })} /></Field>
            </div>
            <div className="hidden md:block"><BodyMap activeMuscles={muscles} size="sm" initialView="back" /></div>
          </div>
          <div className="mt-4 flex justify-end">
            <button type="submit" disabled={!valid} className="rounded-md bg-teal-600 px-5 py-2 text-sm font-semibold text-white enabled:hover:bg-teal-700 disabled:opacity-40">{form.id ? "수정 저장" : "프로그램 등록"}</button>
          </div>
        </Card>

        {form.id && (
          <Card title="이 프로그램에 연결된 홈운동 (저장 즉시 반영)">
            <ul className="grid gap-1.5 md:grid-cols-2">
              {exercises.map((e) => {
                const on = maps.some((m) => m.programId === form.id && m.exerciseId === e.id);
                return (
                  <li key={e.id}>
                    <label className={`flex cursor-pointer items-start gap-2 rounded-lg border px-3 py-2 text-xs ${on ? "border-teal-500 bg-teal-50" : "border-slate-200 hover:bg-slate-50"}`}>
                      <input type="checkbox" className="mt-0.5" checked={on} onChange={() => toggleEx(form.id!, e.id)} />
                      <span><b className="text-slate-800">{e.title}</b><span className="block text-slate-500">{e.targetArea}</span></span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </Card>
        )}
      </form>
    </div>
  );
}
