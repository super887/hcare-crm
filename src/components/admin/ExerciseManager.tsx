"use client";

import { useState } from "react";
import { ExternalLink, Plus } from "lucide-react";
import { useHcareStore } from "@/lib/store";
import { ActiveBadge, Card, Field, inputCls } from "./ui";

interface Form {
  id?: string;
  title: string;
  targetArea: string;
  videoUrl: string;
  stepsText: string;
  prescriptionDefault: string;
  precautionNote: string;
}
const blank: Form = { title: "", targetArea: "", videoUrl: "", stepsText: "", prescriptionDefault: "", precautionNote: "" };

export function ExerciseManager() {
  const exercises = useHcareStore((s) => s.exercises);
  const upsert = useHcareStore((s) => s.upsertExercise);
  const toggleActive = useHcareStore((s) => s.toggleExerciseActive);
  const [form, setForm] = useState<Form>(blank);

  const edit = (id: string) => {
    const e = exercises.find((x) => x.id === id);
    if (!e) return;
    setForm({ id: e.id, title: e.title, targetArea: e.targetArea, videoUrl: e.videoUrl, stepsText: e.stepsGuide.join("\n"), prescriptionDefault: e.prescriptionDefault, precautionNote: e.precautionNote ?? "" });
  };

  const steps = form.stepsText.split("\n").map((s) => s.trim()).filter(Boolean);
  const valid = form.title.trim() && form.videoUrl.trim() && steps.length > 0;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    const prev = exercises.find((x) => x.id === form.id);
    upsert({
      id: form.id,
      title: form.title.trim(),
      targetArea: form.targetArea.trim() || "전신",
      videoUrl: form.videoUrl.trim(),
      stepsGuide: steps,
      prescriptionDefault: form.prescriptionDefault.trim() || "10회 × 2세트",
      precautionNote: form.precautionNote.trim() || undefined,
      isActive: prev?.isActive ?? true,
    });
    if (!form.id) setForm(blank);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
      <Card title={`홈운동 자료 (${exercises.length})`} right={<button type="button" onClick={() => setForm(blank)} className="flex items-center gap-1 rounded-md bg-teal-600 px-2.5 py-1.5 text-xs font-semibold text-white"><Plus size={13} />새 운동</button>}>
        <ul className="space-y-1.5">
          {exercises.map((e) => (
            <li key={e.id}>
              <button type="button" onClick={() => edit(e.id)} className={`w-full rounded-lg border px-3 py-2 text-left ${form.id === e.id ? "border-teal-500 bg-teal-50" : "border-slate-200 hover:bg-slate-50"} ${e.isActive ? "" : "opacity-50"}`}>
                <div className="flex items-center justify-between gap-2"><span className="text-sm font-semibold text-slate-800">{e.title}</span><ActiveBadge active={e.isActive} /></div>
                <div className="text-[11px] text-slate-500">{e.targetArea} · {e.prescriptionDefault}</div>
              </button>
            </li>
          ))}
        </ul>
      </Card>

      <form onSubmit={submit}>
        <Card title={form.id ? "홈운동 수정" : "새 홈운동 등록"} right={form.id ? <button type="button" onClick={() => toggleActive(form.id!)} className="rounded border border-slate-200 px-2 py-1 text-[11px] text-slate-600 hover:bg-slate-50">{exercises.find((x) => x.id === form.id)?.isActive ? "비활성화" : "활성화"}</button> : undefined}>
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="운동명"><input className={inputCls} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
            <Field label="타겟 부위"><input className={inputCls} value={form.targetArea} onChange={(e) => setForm({ ...form, targetArea: e.target.value })} /></Field>
            <Field label="영상 URL" hint="(유튜브·비메오 링크)" className="md:col-span-2">
              <div className="flex gap-2">
                <input className={inputCls} value={form.videoUrl} onChange={(e) => setForm({ ...form, videoUrl: e.target.value })} placeholder="https://www.youtube.com/watch?v=..." />
                {form.videoUrl && <a href={form.videoUrl} target="_blank" rel="noreferrer" className="flex items-center rounded-md border border-slate-300 px-3 text-slate-500 hover:bg-slate-50" aria-label="영상 열기"><ExternalLink size={15} /></a>}
              </div>
            </Field>
            <Field label="단계별 수행 방법" hint="(한 줄에 한 단계)" className="md:col-span-2"><textarea rows={5} className={inputCls} value={form.stepsText} onChange={(e) => setForm({ ...form, stepsText: e.target.value })} /></Field>
            <Field label="기본 권장량"><input className={inputCls} value={form.prescriptionDefault} onChange={(e) => setForm({ ...form, prescriptionDefault: e.target.value })} placeholder="10초 유지 × 10회 / 하루 2세트" /></Field>
            <Field label="고객용 주의사항"><input className={inputCls} value={form.precautionNote} onChange={(e) => setForm({ ...form, precautionNote: e.target.value })} /></Field>
          </div>
          <div className="mt-4 flex justify-end">
            <button type="submit" disabled={!valid} className="rounded-md bg-teal-600 px-5 py-2 text-sm font-semibold text-white enabled:hover:bg-teal-700 disabled:opacity-40">{form.id ? "수정 저장" : "운동 등록"}</button>
          </div>
        </Card>
      </form>
    </div>
  );
}
