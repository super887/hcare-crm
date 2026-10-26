"use client";

import { useMemo, useState } from "react";
import { CalendarCheck, CheckCircle2, ChevronDown, Circle, ExternalLink, Home, History, Info, Play, Smartphone } from "lucide-react";
import { BodyMap } from "@/components/body-map";
import { todayStr, useHcareStore, useHydrated } from "@/lib/store";

const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const DOW = ["일", "월", "화", "수", "목", "금", "토"];

function lastSevenDays() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return { date: fmt(d), label: DOW[d.getDay()], isToday: i === 6 };
  });
}

export default function MyPage() {
  const hydrated = useHydrated();
  const clients = useHcareStore((s) => s.clients);
  const currentId = useHcareStore((s) => s.currentClientId);
  const setCurrent = useHcareStore((s) => s.setCurrentClient);
  const packages = useHcareStore((s) => s.clientPackages);
  const sessions = useHcareStore((s) => s.sessions);
  const programs = useHcareStore((s) => s.programs);
  const exercises = useHcareStore((s) => s.exercises);
  const assigned = useHcareStore((s) => s.assignedExercises);
  const logs = useHcareStore((s) => s.exerciseCheckLogs);
  const toggleCheck = useHcareStore((s) => s.toggleExerciseCheck);

  const [tab, setTab] = useState<"home" | "history">("home");
  const [openId, setOpenId] = useState<string | null>(null);

  const client = clients.find((c) => c.id === currentId) ?? clients[0];
  const today = todayStr();

  const pkg = client ? packages.find((p) => p.clientId === client.id && p.status === "active") ?? packages.find((p) => p.clientId === client.id) : undefined;
  const mySessions = useMemo(() => (client ? sessions.filter((s) => s.clientId === client.id).sort((a, b) => b.sessionNumber - a.sessionNumber) : []), [sessions, client]);
  const lastSession = mySessions[0];
  const myAssigned = useMemo(
    () => (client ? assigned.filter((a) => a.clientId === client.id && a.isActive).flatMap((a) => { const ex = exercises.find((e) => e.id === a.exerciseId); return ex ? [{ a, ex }] : []; }) : []),
    [assigned, exercises, client],
  );
  const myLogs = useMemo(() => (client ? logs.filter((l) => l.clientId === client.id && l.completed) : []), [logs, client]);
  const days = useMemo(lastSevenDays, []);
  const doneToday = myAssigned.filter(({ a }) => myLogs.some((l) => l.assignedExerciseId === a.id && l.checkedDate === today)).length;
  const weekDays = days.filter((d) => myLogs.some((l) => l.checkedDate === d.date)).length;

  // 오늘 관리받은 타겟 근육 (최근 회차의 적용 프로그램 기준)
  const targetMuscles = useMemo(
    () => [...new Set((lastSession?.selectedProgramIds ?? []).flatMap((id) => programs.find((p) => p.id === id)?.targetMuscles ?? []))],
    [lastSession, programs],
  );

  if (!hydrated) return <div className="p-10 text-center text-sm text-slate-400">불러오는 중…</div>;
  if (!client) return <div className="p-10 text-center text-sm text-slate-400">등록된 고객이 없습니다.</div>;

  return (
    <main className="flex min-h-[calc(100vh-48px)] flex-col items-center gap-3 bg-slate-100 px-0 py-4 sm:px-4">
      <div className="flex flex-wrap items-center justify-center gap-2 px-3 text-xs text-slate-500">
        <Smartphone size={14} />
        <span>고객 스마트폰 화면 미리보기 · 로그인 고객:</span>
        <select value={client.id} onChange={(e) => setCurrent(e.target.value)} className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-800">
          {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {/* 스마트폰 프레임 */}
      <div className="flex h-[min(820px,calc(100vh-130px))] min-h-[560px] w-full max-w-[400px] flex-col overflow-hidden bg-white sm:rounded-[2.5rem] sm:border-[10px] sm:border-slate-900 sm:shadow-2xl">
        <div className="flex-1 overflow-y-auto bg-slate-50">
          {/* 헤더 */}
          <div className="bg-gradient-to-br from-teal-600 to-teal-800 px-5 pb-6 pt-6 text-white">
            <p className="text-xs text-teal-100">안녕하세요 👋</p>
            <h1 className="text-xl font-bold">{client.name} 님</h1>
            {pkg && (
              <div className="mt-4 rounded-2xl bg-white/15 p-3.5 backdrop-blur">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold">{pkg.packageName}</span>
                  <span>{pkg.status === "completed" ? "이용 완료" : `잔여 ${pkg.totalSessions - pkg.usedSessions}회`}</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/25"><div className="h-full rounded-full bg-white" style={{ width: `${Math.round((pkg.usedSessions / pkg.totalSessions) * 100)}%` }} /></div>
                <div className="mt-1.5 text-[11px] text-teal-100">{pkg.usedSessions}회 이용 / 총 {pkg.totalSessions}회{pkg.expiryDate ? ` · ${pkg.expiryDate}까지` : ""}</div>
              </div>
            )}
          </div>

          {tab === "home" ? (
            <div className="space-y-4 p-4">
              {/* 집중 케어 부위 리포트 */}
              <section className="rounded-2xl bg-white p-4 shadow-sm">
                <h2 className="text-sm font-bold text-slate-800">오늘의 집중 케어 부위</h2>
                {lastSession && targetMuscles.length > 0 ? (
                  <>
                    <p className="mb-2 text-[11px] text-slate-400">{lastSession.sessionDate} · {lastSession.sessionNumber}회차에서 관리받은 부위예요</p>
                    <div className="flex justify-center"><BodyMap activeMuscles={targetMuscles} size="sm" initialView="back" /></div>
                    <div className="mt-2 flex flex-wrap gap-1">{targetMuscles.map((m) => <span key={m} className="rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-medium text-rose-600">{m}</span>)}</div>
                  </>
                ) : (
                  <p className="py-4 text-center text-xs text-slate-400">첫 관리를 받으시면 집중 케어 부위가 표시돼요.</p>
                )}
              </section>

              {/* 홈운동 */}
              <section>
                <div className="mb-2 flex items-end justify-between px-1">
                  <h2 className="text-sm font-bold text-slate-800">오늘의 맞춤 홈운동</h2>
                  {myAssigned.length > 0 && <span className="text-xs font-semibold text-teal-700">{doneToday}/{myAssigned.length} 완료</span>}
                </div>

                {myAssigned.length > 0 && (
                  <div className="mb-3 rounded-2xl bg-white p-3 shadow-sm">
                    <div className="mb-2 flex items-center justify-between text-xs text-slate-500"><span className="flex items-center gap-1"><CalendarCheck size={13} /> 최근 7일</span><b className="text-teal-700">{weekDays}일 수행</b></div>
                    <div className="flex justify-between">
                      {days.map((d) => {
                        const on = myLogs.some((l) => l.checkedDate === d.date);
                        return (
                          <div key={d.date} className="flex flex-col items-center gap-1">
                            <span className={`flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-bold ${on ? "bg-teal-500 text-white" : d.isToday ? "border-2 border-dashed border-teal-300 text-teal-500" : "bg-slate-100 text-slate-300"}`}>{on ? "✓" : ""}</span>
                            <span className={`text-[10px] ${d.isToday ? "font-bold text-teal-700" : "text-slate-400"}`}>{d.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {myAssigned.length === 0 ? (
                  <p className="rounded-2xl bg-white p-6 text-center text-xs text-slate-400 shadow-sm">관리사님이 홈운동을 배정하면 여기에 표시돼요.</p>
                ) : (
                  <ul className="space-y-3">
                    {myAssigned.map(({ a, ex }) => {
                      const done = myLogs.some((l) => l.assignedExerciseId === a.id && l.checkedDate === today);
                      const open = openId === a.id;
                      return (
                        <li key={a.id} className={`overflow-hidden rounded-2xl bg-white shadow-sm ring-2 transition-all ${done ? "ring-teal-400" : "ring-transparent"}`}>
                          <a href={ex.videoUrl} target="_blank" rel="noreferrer" className="relative flex h-28 items-center justify-center bg-gradient-to-br from-slate-800 to-slate-700 text-white">
                            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur"><Play size={22} fill="white" /></span>
                            <span className="absolute bottom-2 right-3 flex items-center gap-1 text-[10px] text-slate-300">영상 보기 <ExternalLink size={10} /></span>
                            <span className="absolute left-3 top-2 rounded bg-white/15 px-1.5 py-0.5 text-[10px]">{ex.targetArea}</span>
                          </a>
                          <div className="p-3.5">
                            <h3 className="text-sm font-bold text-slate-900">{ex.title}</h3>
                            <p className="mt-0.5 text-xs font-semibold text-teal-700">{a.customPrescription ?? ex.prescriptionDefault}</p>
                            <button type="button" onClick={() => setOpenId(open ? null : a.id)} className="mt-2 flex items-center gap-1 text-[11px] text-slate-500">따라하는 방법 <ChevronDown size={12} className={open ? "rotate-180" : ""} /></button>
                            {open && (
                              <div className="mt-2 space-y-2 text-xs text-slate-600">
                                <ol className="list-decimal space-y-1 pl-4">{ex.stepsGuide.map((s, i) => <li key={i}>{s}</li>)}</ol>
                                {ex.precautionNote && <p className="flex gap-1.5 rounded-lg bg-amber-50 p-2 text-amber-800"><Info size={13} className="mt-0.5 shrink-0" />{ex.precautionNote}</p>}
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={() => toggleCheck(a.id)}
                              className={`mt-3 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-colors ${done ? "bg-teal-50 text-teal-700 ring-1 ring-teal-300" : "bg-teal-600 text-white active:bg-teal-700"}`}
                            >
                              {done ? <><CheckCircle2 size={18} /> 오늘 완료! (눌러서 취소)</> : <><Circle size={18} /> 오늘 운동 완료 체크</>}
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            </div>
          ) : (
            <div className="space-y-3 p-4">
              <h2 className="px-1 text-sm font-bold text-slate-800">나의 관리 이력 <span className="font-normal text-slate-400">({mySessions.length}회)</span></h2>
              {mySessions.length === 0 ? (
                <p className="rounded-2xl bg-white p-6 text-center text-xs text-slate-400 shadow-sm">아직 관리 이력이 없어요.</p>
              ) : (
                mySessions.map((s) => (
                  <article key={s.id} className="rounded-2xl bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <b className="text-sm text-slate-900">{s.sessionNumber}회차</b>
                      <span className="text-[11px] text-slate-400">{s.sessionDate} · {s.therapistName}</span>
                    </div>
                    {s.painLevelBefore !== undefined && s.painLevelAfter !== undefined && (
                      <p className="mt-1 text-[11px] text-slate-500">통증 정도 <b className="text-slate-700">{s.painLevelBefore}</b> → <b className="text-teal-700">{s.painLevelAfter}</b></p>
                    )}
                    <ul className="mt-2 space-y-1.5">
                      {s.selectedProgramIds.map((id) => {
                        const p = programs.find((x) => x.id === id);
                        return p ? <li key={id} className="rounded-lg bg-teal-50 p-2 text-xs text-teal-900"><b>{p.title}</b><br />{p.clientSummaryTemplate}</li> : null;
                      })}
                    </ul>
                    {s.clientPublicNote && <p className="mt-2 rounded-lg bg-slate-50 p-2.5 text-xs leading-relaxed text-slate-700">💬 {s.clientPublicNote}</p>}
                  </article>
                ))
              )}
            </div>
          )}
        </div>

        {/* 하단 탭 */}
        <nav className="grid grid-cols-2 border-t border-slate-200 bg-white">
          {([["home", "홈 · 홈운동", Home], ["history", "관리 이력", History]] as const).map(([k, label, Icon]) => (
            <button key={k} type="button" onClick={() => setTab(k)} className={`flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-semibold ${tab === k ? "text-teal-700" : "text-slate-400"}`}>
              <Icon size={18} /> {label}
            </button>
          ))}
        </nav>
      </div>
    </main>
  );
}
