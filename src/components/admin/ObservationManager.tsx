"use client";

import { useMemo, useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { useHcareStore } from "@/lib/store";
import type { ObservationCategory } from "@/types/hcare";
import { ActiveBadge, Card, Field, inputCls } from "./ui";

const DEFAULT_CATEGORIES = ["경추·어깨", "흉추·견갑", "요추·골반", "하지·보행"];
const blank = { id: undefined as string | undefined, category: "경추·어깨", label: "", description: "" };

export function ObservationManager() {
  const observations = useHcareStore((s) => s.observations);
  const upsert = useHcareStore((s) => s.upsertObservation);
  const toggle = useHcareStore((s) => s.toggleObservationActive);
  const rules = useHcareStore((s) => s.rules);
  const [form, setForm] = useState(blank);

  const categories = useMemo(() => [...new Set([...DEFAULT_CATEGORIES, ...observations.map((o) => o.category)])], [observations]);
  const grouped = useMemo(
    () => categories.map((c) => ({ c, items: observations.filter((o) => o.category === c).sort((a, b) => a.displayOrder - b.displayOrder) })).filter((g) => g.items.length),
    [categories, observations],
  );

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.label.trim() || !form.category.trim()) return;
    const prev = observations.find((o) => o.id === form.id);
    upsert({
      id: form.id,
      category: form.category.trim() as ObservationCategory,
      label: form.label.trim(),
      description: form.description.trim() || undefined,
      displayOrder: prev?.displayOrder ?? 0,
      isActive: prev?.isActive ?? true,
    });
    setForm(blank);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-4">
        {grouped.map(({ c, items }) => (
          <Card key={c} title={`${c} (${items.length})`}>
            <ul className="divide-y divide-slate-100">
              {items.map((o) => (
                <li key={o.id} className="flex items-center gap-3 py-2">
                  <div className={`min-w-0 flex-1 ${o.isActive ? "" : "opacity-50"}`}>
                    <div className="text-sm font-semibold text-slate-800">{o.label}</div>
                    {o.description && <div className="truncate text-[11px] text-slate-500">{o.description}</div>}
                    <div className="text-[10px] text-slate-400">연결된 프로그램 {rules.filter((r) => r.observationId === o.id).length}개</div>
                  </div>
                  <ActiveBadge active={o.isActive} />
                  <button type="button" onClick={() => setForm({ id: o.id, category: o.category, label: o.label, description: o.description ?? "" })} className="rounded p-1.5 text-slate-500 hover:bg-slate-100" aria-label="수정">
                    <Pencil size={14} />
                  </button>
                  <button type="button" onClick={() => toggle(o.id)} className="rounded border border-slate-200 px-2 py-1 text-[11px] text-slate-600 hover:bg-slate-50">
                    {o.isActive ? "비활성화" : "활성화"}
                  </button>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>

      <form onSubmit={submit} className="h-fit space-y-3 rounded-xl border border-teal-200 bg-teal-50/40 p-4 lg:sticky lg:top-16">
        <h3 className="flex items-center gap-1.5 text-sm font-bold text-teal-800"><Plus size={15} />{form.id ? "관찰 항목 수정" : "관찰 항목 추가"}</h3>
        <Field label="부위 분류">
          <input list="obs-categories" className={inputCls} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          <datalist id="obs-categories">{categories.map((c) => <option key={c} value={c} />)}</datalist>
        </Field>
        <Field label="관찰 항목명">
          <input className={inputCls} value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="예: 팔 들 때 어깨 앞쪽 통증" />
        </Field>
        <Field label="관찰 팁" hint="(선택)">
          <textarea rows={3} className={inputCls} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="관리사가 확인할 평가 방법" />
        </Field>
        <div className="flex gap-2">
          <button type="submit" disabled={!form.label.trim()} className="flex-1 rounded-md bg-teal-600 py-2 text-sm font-semibold text-white enabled:hover:bg-teal-700 disabled:opacity-40">
            {form.id ? "수정 저장" : "추가하기"}
          </button>
          {form.id && <button type="button" onClick={() => setForm(blank)} className="rounded-md border border-slate-300 px-3 text-sm">취소</button>}
        </div>
        <p className="text-[11px] text-slate-500">새 항목은 &lsquo;연결 기준&rsquo; 탭에서 관리 프로그램과 연결해야 추천에 반영됩니다.</p>
      </form>
    </div>
  );
}
