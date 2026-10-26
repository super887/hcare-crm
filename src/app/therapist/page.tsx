"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, ClipboardList, History, Smartphone } from "lucide-react";
import { getRecommendedPrograms } from "@/lib/matching-engine";
import { useHcareStore, useHydrated } from "@/lib/store";
import type { Client } from "@/types/hcare";
import { ClientSidebar } from "@/components/therapist/ClientSidebar";
import { ClientHistory } from "@/components/therapist/ClientHistory";
import { ObservationChecklist } from "@/components/therapist/ObservationChecklist";
import { RecommendationPanel } from "@/components/therapist/RecommendationPanel";
import { SessionSaveForm, type SessionFormValues } from "@/components/therapist/SessionSaveForm";
import { DemoGuideBanner } from "@/components/demo/DemoGuideBanner";

const emptyForm: SessionFormValues = { exerciseIds: [], therapistPrivateNote: "", clientPublicNote: "", painBefore: "", painAfter: "" };

function ClientSummary({ client }: { client: Client }) {
  const packages = useHcareStore((s) => s.clientPackages);
  const pkg = packages.find((p) => p.clientId === client.id && p.status === "active") ?? packages.find((p) => p.clientId === client.id);
  const remaining = pkg ? pkg.totalSessions - pkg.usedSessions : 0;
  const pct = pkg ? Math.round((pkg.usedSessions / pkg.totalSessions) * 100) : 0;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">{client.name} <span className="text-sm font-normal text-slate-400">님</span></h2>
          <p className="text-xs text-slate-500">{client.occupation ?? "직업 정보 없음"}</p>
        </div>
        {pkg && (
          <div className="min-w-[200px]">
            <div className="flex justify-between text-xs"><span className="font-semibold text-slate-700">{pkg.packageName}</span><span className="text-teal-700">잔여 {remaining}/{pkg.totalSessions}회</span></div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full bg-teal-500" style={{ width: `${pct}%` }} /></div>
          </div>
        )}
      </div>
      <div className="mt-3 grid gap-2 text-xs sm:grid-cols-3">
        <div className="rounded-lg bg-slate-50 p-2.5"><div className="mb-0.5 font-semibold text-slate-500">주요 호소</div><p className="line-clamp-3 text-slate-700">{client.consultationNotes ?? "-"}</p></div>
        <div className="rounded-lg bg-slate-50 p-2.5"><div className="mb-0.5 font-semibold text-slate-500">선호사항</div><p className="text-slate-700">{client.preferences ?? "-"}</p></div>
        <div className="rounded-lg bg-amber-50 p-2.5"><div className="mb-0.5 font-semibold text-amber-700">⚠ 특이사항·주의</div><p className="text-amber-900">{client.precautionsMemo ?? "없음"}</p></div>
      </div>
    </section>
  );
}

function RecordWorkspace({ client, onSaved }: { client: Client; onSaved: (sessionNumber: number) => void }) {
  const observations = useHcareStore((s) => s.observations);
  const programs = useHcareStore((s) => s.programs);
  const exercises = useHcareStore((s) => s.exercises);
  const rules = useHcareStore((s) => s.rules);
  const maps = useHcareStore((s) => s.programExerciseMaps);
  const sessions = useHcareStore((s) => s.sessions);
  const packages = useHcareStore((s) => s.clientPackages);
  const saveSession = useHcareStore((s) => s.saveSession);

  const [checkedIds, setCheckedIds] = useState<string[]>([]);
  const [selectedProgramIds, setSelectedProgramIds] = useState<string[]>([]);
  const [form, setForm] = useState<SessionFormValues>(emptyForm);

  const result = useMemo(
    () => getRecommendedPrograms(checkedIds, { observations, programs, exercises, rules, programExerciseMaps: maps }),
    [checkedIds, observations, programs, exercises, rules, maps],
  );

  // 관찰 항목을 해제해 후보에서 사라진 프로그램은 선택에서도 제외
  const selectedRecommendations = useMemo(
    () => result.recommendations.filter((r) => selectedProgramIds.includes(r.program.id)),
    [result, selectedProgramIds],
  );

  const lastSession = useMemo(
    () => sessions.filter((s) => s.clientId === client.id).sort((a, b) => b.sessionNumber - a.sessionNumber)[0],
    [sessions, client.id],
  );
  const activePkg = packages.find((p) => p.clientId === client.id && p.status === "active");

  const toggleObservation = (id: string) =>
    setCheckedIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));

  const toggleProgram = (programId: string) => {
    const rec = result.recommendations.find((r) => r.program.id === programId);
    if (!rec) return;
    const exIds = rec.recommendedExercises.map((e) => e.id);
    if (selectedProgramIds.includes(programId)) {
      const remainingIds = selectedProgramIds.filter((id) => id !== programId);
      const stillRecommended = new Set(
        result.recommendations.filter((r) => remainingIds.includes(r.program.id)).flatMap((r) => r.recommendedExercises.map((e) => e.id)),
      );
      setSelectedProgramIds(remainingIds);
      setForm((f) => ({ ...f, exerciseIds: f.exerciseIds.filter((id) => !exIds.includes(id) || stillRecommended.has(id)) }));
    } else {
      setSelectedProgramIds([...selectedProgramIds, programId]);
      setForm((f) => ({ ...f, exerciseIds: [...new Set([...f.exerciseIds, ...exIds])] }));
    }
  };

  const canSave = selectedRecommendations.length > 0 && !!activePkg;
  const disabledReason = !activePkg
    ? "이용 가능한 패키지가 없습니다."
    : selectedRecommendations.length === 0
      ? "적용할 프로그램을 1개 이상 선택하세요."
      : undefined;

  const num = (v: string) => (v === "" ? undefined : Math.min(10, Math.max(0, Number(v))));

  const onSave = () => {
    const session = saveSession({
      clientId: client.id,
      checkedObservationIds: checkedIds,
      selectedProgramIds: selectedRecommendations.map((r) => r.program.id),
      exerciseIds: form.exerciseIds,
      therapistPrivateNote: form.therapistPrivateNote.trim() || undefined,
      clientPublicNote: form.clientPublicNote.trim() || undefined,
      painLevelBefore: num(form.painBefore),
      painLevelAfter: num(form.painAfter),
    });
    onSaved(session.sessionNumber);
  };

  return (
    <div className="space-y-4">
      {lastSession && checkedIds.length === 0 && (
        <button
          type="button"
          onClick={() => setCheckedIds(lastSession.checkedObservationIds)}
          className="flex items-center gap-1.5 rounded-md border border-dashed border-slate-300 px-3 py-1.5 text-xs text-slate-500 hover:bg-white"
        >
          <History size={13} /> 지난 {lastSession.sessionNumber}회차 체크 항목 불러오기
        </button>
      )}
      <div className="grid gap-4 xl:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
        <ObservationChecklist observations={observations} checkedIds={checkedIds} onToggle={toggleObservation} onClear={() => { setCheckedIds([]); setSelectedProgramIds([]); setForm((f) => ({ ...f, exerciseIds: [] })); }} />
        <RecommendationPanel result={result} checkedCount={checkedIds.length} selectedProgramIds={selectedProgramIds} onToggleProgram={toggleProgram} />
      </div>
      <SessionSaveForm
        clientName={client.name}
        selectedRecommendations={selectedRecommendations}
        allExercises={exercises}
        values={form}
        onChange={(patch) => setForm((f) => ({ ...f, ...patch }))}
        onSave={onSave}
        canSave={canSave}
        disabledReason={disabledReason}
      />
    </div>
  );
}

export default function TherapistPage() {
  const hydrated = useHydrated();
  const clients = useHcareStore((s) => s.clients);
  const selectedId = useHcareStore((s) => s.selectedClientId);
  const setCurrentClient = useHcareStore((s) => s.setCurrentClient);
  const setRole = useHcareStore((s) => s.setRole);
  const client = clients.find((c) => c.id === selectedId) ?? clients[0];

  const [tab, setTab] = useState<"record" | "history">("record");
  const [formKey, setFormKey] = useState(0);
  const [savedMsg, setSavedMsg] = useState<{ clientId: string; name: string; n: number } | null>(null);

  if (!hydrated) return <div className="p-10 text-center text-sm text-slate-400">불러오는 중…</div>;

  return (
    <main className="mx-auto grid max-w-[1600px] gap-4 p-4 lg:grid-cols-[280px_minmax(0,1fr)]">
      <ClientSidebar />

      <div className="min-w-0 space-y-4">
        {!client ? (
          <p className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-400">왼쪽에서 고객을 선택하거나 신규 등록하세요.</p>
        ) : (
          <>
            <DemoGuideBanner />
            <ClientSummary client={client} />

            {savedMsg && savedMsg.clientId === client.id && (
              <div className="flex flex-wrap items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
                <CheckCircle2 size={18} className="text-emerald-600" />
                <span><b>{savedMsg.name}님 {savedMsg.n}회차</b> 기록이 저장되고 홈운동이 배정되었습니다.</span>
                <Link
                  href="/my"
                  onClick={() => { setCurrentClient(savedMsg.clientId); setRole("client"); }}
                  className="ml-auto flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                >
                  <Smartphone size={13} /> 고객 화면에서 확인
                </Link>
              </div>
            )}

            <div className="flex gap-1 border-b border-slate-200">
              {([["record", "기록 작성 · 맞춤 가이드", ClipboardList], ["history", "고객 정보 · 관리 이력", History]] as const).map(([k, label, Icon]) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setTab(k)}
                  className={`-mb-px flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-semibold ${tab === k ? "border-teal-600 text-teal-700" : "border-transparent text-slate-500 hover:text-slate-700"}`}
                >
                  <Icon size={15} /> {label}
                </button>
              ))}
            </div>

            {tab === "record" ? (
              <RecordWorkspace
                key={`${client.id}-${formKey}`}
                client={client}
                onSaved={(n) => {
                  setSavedMsg({ clientId: client.id, name: client.name, n });
                  setFormKey((k) => k + 1);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />
            ) : (
              <ClientHistory client={client} />
            )}
          </>
        )}
      </div>
    </main>
  );
}
