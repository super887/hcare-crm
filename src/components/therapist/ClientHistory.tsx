"use client";

import { useEffect, useMemo, useState } from "react";
import { EyeOff, Pencil, Save } from "lucide-react";
import { useHcareStore } from "@/lib/store";
import type { Client } from "@/types/hcare";

const genderLabel = { F: "여성", M: "남성", OTHER: "기타" } as const;

export function ClientHistory({ client }: { client: Client }) {
  const sessions = useHcareStore((s) => s.sessions);
  const observations = useHcareStore((s) => s.observations);
  const programs = useHcareStore((s) => s.programs);
  const assigned = useHcareStore((s) => s.assignedExercises);
  const logs = useHcareStore((s) => s.exerciseCheckLogs);
  const updateClient = useHcareStore((s) => s.updateClient);

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({
    consultationNotes: client.consultationNotes ?? "",
    preferences: client.preferences ?? "",
    precautionsMemo: client.precautionsMemo ?? "",
  });
  useEffect(() => {
    setEditing(false);
    setDraft({
      consultationNotes: client.consultationNotes ?? "",
      preferences: client.preferences ?? "",
      precautionsMemo: client.precautionsMemo ?? "",
    });
  }, [client.id, client.consultationNotes, client.preferences, client.precautionsMemo]);

  const obsLabel = useMemo(() => new Map(observations.map((o) => [o.id, o.label.replace(/\s*\(.*\)/, "")])), [observations]);
  const progTitle = useMemo(() => new Map(programs.map((p) => [p.id, p.title])), [programs]);
  const mine = useMemo(() => sessions.filter((s) => s.clientId === client.id).sort((a, b) => b.sessionNumber - a.sessionNumber), [sessions, client.id]);

  const save = () => {
    updateClient(client.id, {
      consultationNotes: draft.consultationNotes || undefined,
      preferences: draft.preferences || undefined,
      precautionsMemo: draft.precautionsMemo || undefined,
    });
    setEditing(false);
  };

  const box = "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-teal-500";

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">기본 정보 · 상담 차트</h3>
          {editing ? (
            <button type="button" onClick={save} className="flex items-center gap-1 rounded-md bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white"><Save size={13} /> 저장</button>
          ) : (
            <button type="button" onClick={() => setEditing(true)} className="flex items-center gap-1 rounded-md border border-slate-300 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50"><Pencil size={13} /> 수정</button>
          )}
        </div>
        <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
          <div><dt className="text-xs text-slate-400">연락처</dt><dd>{client.phone}</dd></div>
          <div><dt className="text-xs text-slate-400">성별 · 생년월일</dt><dd>{client.gender ? genderLabel[client.gender] : "-"} · {client.birthDate ?? "-"}</dd></div>
          <div className="sm:col-span-2"><dt className="text-xs text-slate-400">직업·생활습관</dt><dd>{client.occupation ?? "-"}</dd></div>
          {(
            [
              ["consultationNotes", "상담 내용 (주요 호소 증상)"],
              ["preferences", "선호사항"],
              ["precautionsMemo", "특이사항·주의"],
            ] as const
          ).map(([key, label]) => (
            <div key={key} className="sm:col-span-2">
              <dt className="text-xs text-slate-400">{label}</dt>
              <dd>
                {editing ? (
                  <textarea rows={2} className={box} value={draft[key]} onChange={(e) => setDraft((d) => ({ ...d, [key]: e.target.value }))} />
                ) : (
                  <span className="whitespace-pre-line">{client[key] ?? "-"}</span>
                )}
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-[11px] text-slate-400">개인정보·민감정보 수집 동의: {client.privacyConsent ? `동의 (${client.privacyConsentAt?.slice(0, 10) ?? ""})` : "미동의"}</p>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-sm font-bold text-slate-800">방문 회차별 관리 이력 <span className="font-normal text-slate-400">({mine.length}회)</span></h3>
        {mine.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-400">아직 관리 기록이 없습니다. &lsquo;기록 작성&rsquo; 탭에서 첫 회차를 등록하세요.</p>
        ) : (
          <ol className="relative space-y-4 border-l-2 border-slate-100 pl-5">
            {mine.map((s) => {
              const ae = assigned.filter((a) => a.sessionId === s.id);
              const doneCount = logs.filter((l) => ae.some((a) => a.id === l.assignedExerciseId) && l.completed).length;
              return (
                <li key={s.id} className="relative">
                  <span className="absolute -left-[27px] top-1 flex h-4 w-4 items-center justify-center rounded-full bg-teal-600 ring-4 ring-white" />
                  <div className="flex flex-wrap items-center gap-2">
                    <b className="text-sm text-slate-900">{s.sessionNumber}회차</b>
                    <span className="text-xs text-slate-400">{s.sessionDate} · {s.therapistName}</span>
                    {s.painLevelBefore !== undefined && s.painLevelAfter !== undefined && (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">통증 {s.painLevelBefore} → {s.painLevelAfter}</span>
                    )}
                    {ae.length > 0 && (
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] text-emerald-700">홈운동 {ae.length}종 · 수행 체크 {doneCount}회</span>
                    )}
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {s.checkedObservationIds.map((id) => (
                      <span key={id} className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600">{obsLabel.get(id) ?? id}</span>
                    ))}
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {s.selectedProgramIds.map((id) => (
                      <span key={id} className="rounded-full bg-teal-50 px-2 py-0.5 text-[11px] font-medium text-teal-700 ring-1 ring-teal-100">{progTitle.get(id) ?? id}</span>
                    ))}
                  </div>
                  {s.therapistPrivateNote && (
                    <p className="mt-2 flex gap-1.5 rounded-md bg-indigo-50 p-2 text-xs text-indigo-900"><EyeOff size={13} className="mt-0.5 shrink-0" /><span><b>내부 메모(고객 비공개)</b> {s.therapistPrivateNote}</span></p>
                  )}
                  {s.clientPublicNote && <p className="mt-1.5 rounded-md bg-teal-50 p-2 text-xs text-teal-900"><b>고객 안내</b> {s.clientPublicNote}</p>}
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </div>
  );
}
