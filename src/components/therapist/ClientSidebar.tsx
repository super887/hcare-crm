"use client";

import { useMemo, useState } from "react";
import { Plus, Search, UserRound } from "lucide-react";
import { useHcareStore } from "@/lib/store";
import { NewClientModal } from "./NewClientModal";

export function ClientSidebar() {
  const clients = useHcareStore((s) => s.clients);
  const packages = useHcareStore((s) => s.clientPackages);
  const selectedId = useHcareStore((s) => s.selectedClientId);
  const selectClient = useHcareStore((s) => s.selectClient);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim();
    if (!q) return clients;
    return clients.filter((c) => c.name.includes(q) || c.phone.replace(/-/g, "").includes(q.replace(/-/g, "")));
  }, [clients, query]);

  return (
    <aside className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm lg:sticky lg:top-16 lg:max-h-[calc(100vh-5rem)] lg:self-start lg:overflow-auto">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-800">고객 목록 <span className="text-slate-400">({clients.length})</span></h2>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center gap-1 rounded-md bg-teal-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-teal-700"
        >
          <Plus size={13} /> 신규 등록
        </button>
      </div>

      <div className="relative mb-3">
        <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="이름·전화번호 검색"
          className="w-full rounded-md border border-slate-200 bg-slate-50 py-2 pl-8 pr-2 text-sm outline-none focus:border-teal-500 focus:bg-white"
        />
      </div>

      <ul className="space-y-1.5">
        {filtered.map((c) => {
          const pkg = packages.find((p) => p.clientId === c.id && p.status === "active") ?? packages.find((p) => p.clientId === c.id);
          const remaining = pkg ? pkg.totalSessions - pkg.usedSessions : null;
          const active = c.id === selectedId;
          return (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => selectClient(c.id)}
                className={`w-full rounded-lg border px-3 py-2.5 text-left transition-colors ${
                  active ? "border-teal-500 bg-teal-50" : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`flex h-7 w-7 items-center justify-center rounded-full ${active ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-500"}`}>
                    <UserRound size={14} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-slate-800">{c.name}</div>
                    <div className="truncate text-[11px] text-slate-500">{pkg ? pkg.packageName : "패키지 없음"}</div>
                  </div>
                  {remaining !== null && (
                    <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-teal-700 ring-1 ring-teal-200">
                      잔여 {remaining}회
                    </span>
                  )}
                </div>
              </button>
            </li>
          );
        })}
        {filtered.length === 0 && <li className="py-6 text-center text-xs text-slate-400">검색 결과가 없습니다.</li>}
      </ul>

      {open && <NewClientModal onClose={() => setOpen(false)} />}
    </aside>
  );
}
