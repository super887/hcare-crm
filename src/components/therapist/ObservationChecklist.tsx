"use client";

import { useMemo, useState } from "react";
import { Check } from "lucide-react";
import type { ObservationCategory, ObservationItem } from "@/types/hcare";

const CATEGORIES: ObservationCategory[] = ["경추·어깨", "흉추·견갑", "요추·골반", "하지·보행"];

interface Props {
  observations: ObservationItem[];
  checkedIds: string[];
  onToggle: (id: string) => void;
  onClear: () => void;
}

export function ObservationChecklist({ observations, checkedIds, onToggle, onClear }: Props) {
  const [tab, setTab] = useState<ObservationCategory>("경추·어깨");
  const checked = useMemo(() => new Set(checkedIds), [checkedIds]);

  const byCategory = useMemo(() => {
    const map = new Map<string, ObservationItem[]>();
    for (const o of observations.filter((o) => o.isActive).sort((a, b) => a.displayOrder - b.displayOrder)) {
      map.set(o.category, [...(map.get(o.category) ?? []), o]);
    }
    return map;
  }, [observations]);

  // 기본 카테고리 외에 관리자가 새로 만든 카테고리도 노출
  const tabs = [...CATEGORIES, ...[...byCategory.keys()].filter((k) => !CATEGORIES.includes(k as ObservationCategory))];
  const items = byCategory.get(tab) ?? [];

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-800">
          <span className="mr-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-teal-600 text-[11px] text-white">1</span>
          신체·움직임 관찰 체크 <span className="ml-1 text-xs font-normal text-slate-400">(복수 선택)</span>
        </h3>
        {checkedIds.length > 0 && (
          <button type="button" onClick={onClear} className="text-xs text-slate-400 underline hover:text-slate-600">
            전체 해제 ({checkedIds.length})
          </button>
        )}
      </div>

      <div className="mb-3 flex flex-wrap gap-1.5">
        {tabs.map((c) => {
          const count = (byCategory.get(c) ?? []).filter((o) => checked.has(o.id)).length;
          return (
            <button
              key={c}
              type="button"
              onClick={() => setTab(c as ObservationCategory)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                tab === c ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {c}
              {count > 0 && <span className="rounded-full bg-teal-500 px-1.5 text-[10px] font-bold text-white">{count}</span>}
            </button>
          );
        })}
      </div>

      <ul className="grid gap-2">
        {items.map((o) => {
          const on = checked.has(o.id);
          return (
            <li key={o.id}>
              <button
                type="button"
                role="checkbox"
                aria-checked={on}
                onClick={() => onToggle(o.id)}
                className={`flex w-full items-start gap-3 rounded-lg border-2 px-3 py-2.5 text-left transition-all ${
                  on ? "border-teal-500 bg-teal-50" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 ${on ? "border-teal-600 bg-teal-600 text-white" : "border-slate-300"}`}>
                  {on && <Check size={13} strokeWidth={3} />}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-slate-800">{o.label}</span>
                  {o.description && <span className="mt-0.5 block text-[11px] leading-snug text-slate-500">{o.description}</span>}
                </span>
              </button>
            </li>
          );
        })}
        {items.length === 0 && <li className="py-6 text-center text-xs text-slate-400">이 부위에 등록된 관찰 항목이 없습니다.</li>}
      </ul>
    </section>
  );
}
