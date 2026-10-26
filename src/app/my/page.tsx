"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Award,
  CalendarCheck,
  CheckCircle2,
  ChevronDown,
  Circle,
  ExternalLink,
  History,
  Home,
  Info,
  Monitor,
  Play,
  Smartphone,
  Sparkles,
  X,
} from "lucide-react";
import { BodyMap } from "@/components/body-map";
import { todayStr, useHcareStore, useHydrated } from "@/lib/store";

const fmt = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const DOW = ["일", "월", "화", "수", "목", "금", "토"];

function lastSevenDays() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return { date: fmt(d), label: DOW[d.getDay()], isToday: i === 6 };
  });
}

function getYoutubeId(url?: string): string | null {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match && match[1] ? match[1] : null;
}

function getExerciseThumbnail(ex: { videoUrl?: string; thumbnailUrl?: string }): string | null {
  if (ex.thumbnailUrl) return ex.thumbnailUrl;
  const ytId = getYoutubeId(ex.videoUrl);
  return ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null;
}

export default function MyPage() {
  const hydrated = useHydrated();
  const clients = useHcareStore((s) => s.clients);
  const currentId = useHcareStore((s) => s.currentClientId);
  const setCurrent = useHcareStore((s) => s.setCurrentClient);
  const viewMode = useHcareStore((s) => s.clientViewMode);
  const setViewMode = useHcareStore((s) => s.setClientViewMode);
  const packages = useHcareStore((s) => s.clientPackages);
  const sessions = useHcareStore((s) => s.sessions);
  const programs = useHcareStore((s) => s.programs);
  const exercises = useHcareStore((s) => s.exercises);
  const assigned = useHcareStore((s) => s.assignedExercises);
  const logs = useHcareStore((s) => s.exerciseCheckLogs);
  const toggleCheck = useHcareStore((s) => s.toggleExerciseCheck);

  const [mobileTab, setMobileTab] = useState<"home" | "history">("home");
  const [openId, setOpenId] = useState<string | null>(null);
  const [playingExerciseId, setPlayingExerciseId] = useState<string | null>(null);

  const client = clients.find((c) => c.id === currentId) ?? clients[0];
  const today = todayStr();

  // URL 파라미터로 모바일/PC 뷰 직접 지정 지원 (?view=mobile | ?view=pc)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      const v = sp.get("view");
      if (v === "mobile" || v === "pc") {
        setViewMode(v);
      }
    }
  }, [setViewMode]);

  const pkg = client
    ? packages.find((p) => p.clientId === client.id && p.status === "active") ??
      packages.find((p) => p.clientId === client.id)
    : undefined;

  const mySessions = useMemo(
    () => (client ? sessions.filter((s) => s.clientId === client.id).sort((a, b) => b.sessionNumber - a.sessionNumber) : []),
    [sessions, client],
  );
  const lastSession = mySessions[0];

  const myAssigned = useMemo(
    () =>
      client
        ? assigned
            .filter((a) => a.clientId === client.id && a.isActive)
            .flatMap((a) => {
              const ex = exercises.find((e) => e.id === a.exerciseId);
              return ex ? [{ a, ex }] : [];
            })
        : [],
    [assigned, exercises, client],
  );

  const myLogs = useMemo(
    () => (client ? logs.filter((l) => l.clientId === client.id && l.completed) : []),
    [logs, client],
  );
  const days = useMemo(lastSevenDays, []);
  const doneToday = myAssigned.filter(({ a }) =>
    myLogs.some((l) => l.assignedExerciseId === a.id && l.checkedDate === today),
  ).length;
  const weekDays = days.filter((d) => myLogs.some((l) => l.checkedDate === d.date)).length;

  // 최근 회차의 적용 프로그램 기준 타겟 근육
  const targetMuscles = useMemo(
    () => [
      ...new Set(
        (lastSession?.selectedProgramIds ?? []).flatMap(
          (id) => programs.find((p) => p.id === id)?.targetMuscles ?? [],
        ),
      ),
    ],
    [lastSession, programs],
  );

  if (!hydrated) return <div className="p-10 text-center text-sm text-slate-400">불러오는 중…</div>;
  if (!client) return <div className="p-10 text-center text-sm text-slate-400">등록된 고객이 없습니다.</div>;

  const pct = pkg ? Math.round((pkg.usedSessions / pkg.totalSessions) * 100) : 0;
  const remaining = pkg ? pkg.totalSessions - pkg.usedSessions : 0;

  return (
    <main className="min-h-[calc(100vh-48px)] bg-slate-100 pb-12">
      {/* 상단 고객 선택 & PC/모바일 뷰 전환 바 */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-3 px-4 py-2.5">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span className="font-semibold text-slate-800">로그인 고객 체험 전환:</span>
            <select
              value={client.id}
              onChange={(e) => {
                setCurrent(e.target.value);
                setPlayingExerciseId(null);
              }}
              className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-900 outline-none focus:border-teal-500"
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.occupation?.split(" ")[0] ?? "고객"})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 hidden sm:inline">화면 레이아웃 모드:</span>
            <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setViewMode("pc")}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 font-semibold transition-all ${
                  viewMode === "pc" ? "bg-teal-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Monitor size={14} /> 고객 PC 화면 (와이드 웹)
              </button>
              <button
                type="button"
                onClick={() => setViewMode("mobile")}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 font-semibold transition-all ${
                  viewMode === "mobile" ? "bg-teal-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Smartphone size={14} /> 고객 모바일 (스마트폰 프레임)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================================
          모드 A: 고객 PC 와이드 대시보드 화면 (viewMode === "pc")
         ===================================================================== */}
      {viewMode === "pc" ? (
        <div className="mx-auto max-w-[1440px] space-y-5 px-4 pt-5">
          {/* 상단 히어로 요약 배너 (3단 카드) */}
          <div className="grid gap-4 lg:grid-cols-3">
            {/* 1) 고객 환영 & 패키지 이용 현황 */}
            <div className="rounded-2xl bg-gradient-to-br from-teal-700 via-teal-600 to-emerald-700 p-5 text-white shadow-md">
              <div className="flex items-start justify-between">
                <div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-semibold text-teal-100">
                    <Sparkles size={11} /> 1:1 맞춤형 멤버십 케어
                  </span>
                  <h1 className="mt-1.5 text-2xl font-bold">{client.name} 님, 안녕하세요!</h1>
                  <p className="mt-0.5 text-xs text-teal-100">{client.occupation ?? "맞춤 바디케어 회원"}</p>
                </div>
                {pkg && (
                  <span className="rounded-xl bg-white/20 px-3 py-1.5 text-xs font-bold backdrop-blur">
                    잔여 {remaining}회
                  </span>
                )}
              </div>

              {pkg && (
                <div className="mt-4 rounded-xl bg-black/15 p-3.5 backdrop-blur">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold">{pkg.packageName}</span>
                    <span>
                      {pkg.usedSessions}회 완료 / 총 {pkg.totalSessions}회 ({pct}%)
                    </span>
                  </div>
                  <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/25">
                    <div className="h-full rounded-full bg-white transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="mt-1.5 flex justify-between text-[11px] text-teal-100">
                    <span>시작일: {pkg.startDate}</span>
                    {pkg.expiryDate && <span>유효기간: {pkg.expiryDate}까지</span>}
                  </div>
                </div>
              )}
            </div>

            {/* 2) 오늘의 홈운동 달성률 & 주간 스탬프 */}
            <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-teal-700">
                    <CalendarCheck size={15} /> 주간 홈운동 루틴 트래커
                  </div>
                  <h2 className="mt-1 text-lg font-bold text-slate-900">
                    오늘 운동 {doneToday}/{myAssigned.length}개 완료
                  </h2>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
                  최근 7일 중 {weekDays}일 달성
                </span>
              </div>

              <div className="mt-4 grid grid-cols-7 gap-2">
                {days.map((d) => {
                  const on = myLogs.some((l) => l.checkedDate === d.date);
                  return (
                    <div
                      key={d.date}
                      className={`flex flex-col items-center rounded-xl py-2.5 border ${
                        on
                          ? "border-teal-300 bg-teal-50/70"
                          : d.isToday
                            ? "border-dashed border-teal-400 bg-white"
                            : "border-slate-100 bg-slate-50"
                      }`}
                    >
                      <span className="text-[11px] font-medium text-slate-500">{d.label}</span>
                      <span
                        className={`mt-1.5 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                          on
                            ? "bg-teal-600 text-white shadow-xs"
                            : d.isToday
                              ? "text-teal-600"
                              : "text-slate-300"
                        }`}
                      >
                        {on ? "✓" : d.date.slice(8)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3) 최근 케어 요약 & 통증 호전도 */}
            <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-rose-600">
                    <Activity size={15} /> 최근 방문 케어 리포트
                  </span>
                  {lastSession && (
                    <span className="text-xs text-slate-400">
                      {lastSession.sessionDate} ({lastSession.sessionNumber}회차)
                    </span>
                  )}
                </div>

                {lastSession ? (
                  <>
                    <h3 className="mt-1.5 text-base font-bold text-slate-900">
                      {lastSession.selectedProgramIds
                        .map((id) => programs.find((p) => p.id === id)?.title)
                        .filter(Boolean)
                        .join(" + ")}
                    </h3>
                    <p className="mt-2 rounded-xl bg-slate-50 p-3 text-xs leading-relaxed text-slate-700">
                      💬 <b>{lastSession.therapistName} 코멘트:</b>{" "}
                      {lastSession.clientPublicNote ?? "꾸준한 홈운동으로 바른 정렬을 유지해 보세요."}
                    </p>
                  </>
                ) : (
                  <p className="mt-4 text-xs text-slate-400">아직 등록된 방문 기록이 없습니다.</p>
                )}
              </div>

              {lastSession &&
                lastSession.painLevelBefore !== undefined &&
                lastSession.painLevelAfter !== undefined && (
                  <div className="mt-3 flex items-center justify-between rounded-xl bg-emerald-50 px-3.5 py-2 text-xs">
                    <span className="font-semibold text-emerald-900">관리 전·후 불편감(VAS) 변화</span>
                    <span className="font-bold text-emerald-700">
                      관리 전 {lastSession.painLevelBefore}점 ➔ 관리 후 {lastSession.painLevelAfter}점
                    </span>
                  </div>
                )}
            </div>
          </div>

          {/* 하단 메인 3단 와이드 그리드 (3D 바디맵 + 홈운동 영상 가이드 + 회차별 관리 이력) */}
          <div className="grid gap-5 lg:grid-cols-12">
            {/* 좌측 4열: 3D 인터랙티브 집중 케어 바디맵 */}
            <section className="lg:col-span-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">나의 3D 집중 케어 부위</h2>
                  <p className="text-xs text-slate-500">
                    마우스로 360° 회전하고 휠로 확대하여 관리받은 근육을 확인하세요
                  </p>
                </div>
              </div>

              <div className="flex justify-center my-1">
                <BodyMap activeMuscles={targetMuscles} size="lg" initialView="back" />
              </div>

              {targetMuscles.length > 0 && (
                <div className="mt-4 rounded-xl bg-rose-50/70 border border-rose-100 p-3.5">
                  <div className="text-xs font-bold text-rose-900 mb-2">
                    이번 회차 집중 이완·활성화 타겟 근육 ({targetMuscles.length}곳)
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {targetMuscles.map((m) => (
                      <span
                        key={m}
                        className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-rose-700 shadow-2xs ring-1 ring-rose-200"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* 중앙 5열: 오늘의 맞춤 홈운동 & 영상 플레이어 */}
            <section className="lg:col-span-5 space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">오늘의 맞춤 홈운동 프로그램</h2>
                    <p className="text-xs text-slate-500">
                      담당 관리사가 배정한 맞춤 운동 영상을 보고 오늘 수행 여부를 체크하세요
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700 ring-1 ring-teal-200">
                    <Award size={14} /> {doneToday}/{myAssigned.length} 완료
                  </span>
                </div>

                {myAssigned.length === 0 ? (
                  <p className="rounded-xl bg-slate-50 p-8 text-center text-sm text-slate-400">
                    배정된 홈운동이 없습니다. 관리사 화면에서 회차를 저장하면 즉시 연동됩니다.
                  </p>
                ) : (
                  <ul className="space-y-4">
                    {myAssigned.map(({ a, ex }) => {
                      const done = myLogs.some((l) => l.assignedExerciseId === a.id && l.checkedDate === today);
                      const thumb = getExerciseThumbnail(ex);
                      const ytId = getYoutubeId(ex.videoUrl);
                      const isPlaying = playingExerciseId === a.id && ytId;

                      return (
                        <li
                          key={a.id}
                          className={`overflow-hidden rounded-2xl border-2 bg-white transition-all ${
                            done ? "border-teal-500 shadow-sm" : "border-slate-200"
                          }`}
                        >
                          {/* 유튜브 임베드 플레이어 or 고화질 썸네일 배너 */}
                          {isPlaying ? (
                            <div className="relative aspect-video w-full bg-black">
                              <iframe
                                src={`https://www.youtube.com/embed/${ytId}?autoplay=1`}
                                title={ex.title}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="h-full w-full"
                              />
                              <button
                                type="button"
                                onClick={() => setPlayingExerciseId(null)}
                                className="absolute right-2 top-2 flex items-center gap-1 rounded-md bg-black/75 px-2.5 py-1 text-xs font-semibold text-white hover:bg-black"
                              >
                                <X size={13} /> 닫기
                              </button>
                            </div>
                          ) : (
                            <div className="group relative flex h-48 w-full items-center justify-center overflow-hidden bg-slate-900 text-white">
                              {thumb ? (
                                <img
                                  src={thumb}
                                  alt={ex.title}
                                  className="absolute inset-0 h-full w-full object-cover opacity-90 transition-transform duration-300 group-hover:scale-105"
                                />
                              ) : (
                                <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-700" />
                              )}
                              <div className="absolute inset-0 bg-slate-950/30 transition-colors group-hover:bg-slate-950/15" />

                              {ytId ? (
                                <button
                                  type="button"
                                  onClick={() => setPlayingExerciseId(a.id)}
                                  className="relative flex items-center gap-2 rounded-full bg-rose-600/95 px-4 py-2.5 text-xs font-bold text-white shadow-lg backdrop-blur transition-transform hover:scale-105"
                                >
                                  <Play size={16} fill="white" /> 화면에서 영상 바로 재생
                                </button>
                              ) : (
                                <a
                                  href={ex.videoUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="relative flex items-center gap-2 rounded-full bg-rose-600/95 px-4 py-2.5 text-xs font-bold text-white shadow-lg"
                                >
                                  <Play size={16} fill="white" /> 가이드 영상 열기
                                </a>
                              )}

                              <a
                                href={ex.videoUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="absolute bottom-2.5 right-3 flex items-center gap-1 rounded bg-black/65 px-2.5 py-1 text-[11px] text-white backdrop-blur hover:bg-black"
                              >
                                YouTube 새창 <ExternalLink size={11} />
                              </a>
                              <span className="absolute left-3 top-2.5 rounded-md bg-teal-600/95 px-2.5 py-1 text-[11px] font-bold text-white shadow-xs">
                                {ex.targetArea}
                              </span>
                            </div>
                          )}

                          <div className="p-4">
                            <div className="flex flex-wrap items-start justify-between gap-2">
                              <div>
                                <h3 className="text-base font-bold text-slate-900">{ex.title}</h3>
                                <p className="mt-0.5 text-xs font-semibold text-teal-700">
                                  권장 루틴: {a.customPrescription ?? ex.prescriptionDefault}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => toggleCheck(a.id)}
                                className={`flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
                                  done
                                    ? "bg-teal-50 text-teal-700 ring-2 ring-teal-500"
                                    : "bg-teal-600 text-white shadow-xs hover:bg-teal-700"
                                }`}
                              >
                                {done ? (
                                  <>
                                    <CheckCircle2 size={16} /> 오늘 수행 완료!
                                  </>
                                ) : (
                                  <>
                                    <Circle size={16} /> 오늘 운동 완료 체크
                                  </>
                                )}
                              </button>
                            </div>

                            <div className="mt-3 rounded-xl bg-slate-50 p-3 text-xs text-slate-700">
                              <div className="font-bold text-slate-800 mb-1.5">올바른 수행 순서</div>
                              <ol className="list-decimal space-y-1 pl-4">
                                {ex.stepsGuide.map((step, idx) => (
                                  <li key={idx}>{step}</li>
                                ))}
                              </ol>
                              {ex.precautionNote && (
                                <p className="mt-2 flex items-start gap-1.5 rounded-lg bg-amber-50 p-2 text-amber-900">
                                  <Info size={14} className="mt-0.5 shrink-0 text-amber-600" />
                                  <span>{ex.precautionNote}</span>
                                </p>
                              )}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </section>

            {/* 우측 3열: 방문 회차별 관리 이력 */}
            <section className="lg:col-span-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs h-fit">
              <h2 className="text-base font-bold text-slate-900">나의 방문·관리 이력</h2>
              <p className="mt-0.5 text-xs text-slate-500">총 {mySessions.length}회 케어 기록</p>

              {mySessions.length === 0 ? (
                <p className="mt-6 text-center text-xs text-slate-400">아직 관리 이력이 없습니다.</p>
              ) : (
                <ol className="mt-4 space-y-3.5 border-l-2 border-teal-100 pl-4">
                  {mySessions.map((s) => (
                    <li key={s.id} className="relative rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
                      <span className="absolute -left-[23px] top-4 h-3 w-3 rounded-full bg-teal-600 ring-4 ring-white" />
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-teal-800">{s.sessionNumber}회차 케어</span>
                        <span className="text-[11px] text-slate-400">{s.sessionDate}</span>
                      </div>
                      <div className="mt-0.5 text-[11px] text-slate-500">담당: {s.therapistName}</div>

                      {s.painLevelBefore !== undefined && s.painLevelAfter !== undefined && (
                        <div className="mt-2 inline-block rounded-md bg-white px-2 py-0.5 text-[11px] text-slate-600 ring-1 ring-slate-200">
                          불편감 지수 <b>{s.painLevelBefore}</b> ➔ <b className="text-teal-700">{s.painLevelAfter}</b>
                        </div>
                      )}

                      <ul className="mt-2 space-y-1.5">
                        {s.selectedProgramIds.map((id) => {
                          const p = programs.find((x) => x.id === id);
                          return p ? (
                            <li key={id} className="rounded-lg bg-white p-2 text-xs text-slate-700 shadow-2xs">
                              <b className="text-teal-900">{p.title}</b>
                              <p className="mt-0.5 text-[11px] text-slate-500">{p.clientSummaryTemplate}</p>
                            </li>
                          ) : null;
                        })}
                      </ul>

                      {s.clientPublicNote && (
                        <p className="mt-2 rounded-lg bg-teal-50/80 p-2 text-xs leading-relaxed text-teal-950">
                          💬 {s.clientPublicNote}
                        </p>
                      )}
                    </li>
                  ))}
                </ol>
              )}
            </section>
          </div>
        </div>
      ) : (
        /* =====================================================================
           모드 B: 고객 스마트폰 모바일 프레임 뷰 (viewMode === "mobile")
           ===================================================================== */
        <div className="flex flex-col items-center px-0 pt-4 sm:px-4">
          <div className="flex h-[min(840px,calc(100vh-120px))] min-h-[580px] w-full max-w-[410px] flex-col overflow-hidden bg-white sm:rounded-[2.5rem] sm:border-[10px] sm:border-slate-900 sm:shadow-2xl">
            <div className="flex-1 overflow-y-auto bg-slate-50">
              {/* 모바일 상단 헤더 */}
              <div className="bg-gradient-to-br from-teal-600 to-teal-800 px-5 pb-6 pt-6 text-white">
                <p className="text-xs text-teal-100">안녕하세요 👋</p>
                <h1 className="text-xl font-bold">{client.name} 님</h1>
                {pkg && (
                  <div className="mt-4 rounded-2xl bg-white/15 p-3.5 backdrop-blur">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold">{pkg.packageName}</span>
                      <span>{pkg.status === "completed" ? "이용 완료" : `잔여 ${remaining}회`}</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/25">
                      <div className="h-full rounded-full bg-white" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="mt-1.5 text-[11px] text-teal-100">
                      {pkg.usedSessions}회 이용 / 총 {pkg.totalSessions}회
                      {pkg.expiryDate ? ` · ${pkg.expiryDate}까지` : ""}
                    </div>
                  </div>
                )}
              </div>

              {mobileTab === "home" ? (
                <div className="space-y-4 p-4">
                  {/* 3D 집중 케어 부위 리포트 */}
                  <section className="rounded-2xl bg-white p-4 shadow-sm">
                    <h2 className="text-sm font-bold text-slate-800">오늘의 3D 집중 케어 부위</h2>
                    {lastSession && targetMuscles.length > 0 ? (
                      <>
                        <p className="mb-2 text-[11px] text-slate-400">
                          {lastSession.sessionDate} · {lastSession.sessionNumber}회차 관리 부위 (드래그하여 360° 회전)
                        </p>
                        <div className="flex justify-center">
                          <BodyMap activeMuscles={targetMuscles} size="sm" initialView="back" />
                        </div>
                        <div className="mt-2.5 flex flex-wrap gap-1">
                          {targetMuscles.map((m) => (
                            <span
                              key={m}
                              className="rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-medium text-rose-600"
                            >
                              {m}
                            </span>
                          ))}
                        </div>
                      </>
                    ) : (
                      <p className="py-4 text-center text-xs text-slate-400">
                        첫 관리를 받으시면 집중 케어 부위가 3D로 표시돼요.
                      </p>
                    )}
                  </section>

                  {/* 홈운동 */}
                  <section>
                    <div className="mb-2 flex items-end justify-between px-1">
                      <h2 className="text-sm font-bold text-slate-800">오늘의 맞춤 홈운동</h2>
                      {myAssigned.length > 0 && (
                        <span className="text-xs font-semibold text-teal-700">
                          {doneToday}/{myAssigned.length} 완료
                        </span>
                      )}
                    </div>

                    {myAssigned.length > 0 && (
                      <div className="mb-3 rounded-2xl bg-white p-3 shadow-sm">
                        <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <CalendarCheck size={13} /> 최근 7일
                          </span>
                          <b className="text-teal-700">{weekDays}일 수행</b>
                        </div>
                        <div className="flex justify-between">
                          {days.map((d) => {
                            const on = myLogs.some((l) => l.checkedDate === d.date);
                            return (
                              <div key={d.date} className="flex flex-col items-center gap-1">
                                <span
                                  className={`flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-bold ${
                                    on
                                      ? "bg-teal-500 text-white"
                                      : d.isToday
                                        ? "border-2 border-dashed border-teal-300 text-teal-500"
                                        : "bg-slate-100 text-slate-300"
                                  }`}
                                >
                                  {on ? "✓" : ""}
                                </span>
                                <span className={`text-[10px] ${d.isToday ? "font-bold text-teal-700" : "text-slate-400"}`}>
                                  {d.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {myAssigned.length === 0 ? (
                      <p className="rounded-2xl bg-white p-6 text-center text-xs text-slate-400 shadow-sm">
                        관리사님이 홈운동을 배정하면 여기에 표시돼요.
                      </p>
                    ) : (
                      <ul className="space-y-3">
                        {myAssigned.map(({ a, ex }) => {
                          const done = myLogs.some((l) => l.assignedExerciseId === a.id && l.checkedDate === today);
                          const open = openId === a.id;
                          const thumb = getExerciseThumbnail(ex);
                          return (
                            <li
                              key={a.id}
                              className={`overflow-hidden rounded-2xl bg-white shadow-sm ring-2 transition-all ${
                                done ? "ring-teal-400" : "ring-transparent"
                              }`}
                            >
                              <a
                                href={ex.videoUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="group relative flex h-36 w-full items-center justify-center overflow-hidden bg-slate-900 text-white"
                              >
                                {thumb ? (
                                  <img
                                    src={thumb}
                                    alt={ex.title}
                                    className="absolute inset-0 h-full w-full object-cover opacity-90 transition-transform duration-300 group-hover:scale-105"
                                  />
                                ) : (
                                  <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-700" />
                                )}
                                <div className="absolute inset-0 bg-slate-950/25 transition-colors group-hover:bg-slate-950/15" />
                                <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-rose-600/95 text-white shadow-lg backdrop-blur transition-transform group-hover:scale-110">
                                  <Play size={20} fill="white" className="ml-0.5" />
                                </span>
                                <span className="absolute bottom-2 right-3 flex items-center gap-1 rounded bg-black/60 px-2 py-0.5 text-[10px] text-white backdrop-blur">
                                  영상 재생 <ExternalLink size={10} />
                                </span>
                                <span className="absolute left-3 top-2 rounded bg-teal-600/90 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs backdrop-blur">
                                  {ex.targetArea}
                                </span>
                              </a>
                              <div className="p-3.5">
                                <h3 className="text-sm font-bold text-slate-900">{ex.title}</h3>
                                <p className="mt-0.5 text-xs font-semibold text-teal-700">
                                  {a.customPrescription ?? ex.prescriptionDefault}
                                </p>
                                <button
                                  type="button"
                                  onClick={() => setOpenId(open ? null : a.id)}
                                  className="mt-2 flex items-center gap-1 text-[11px] text-slate-500"
                                >
                                  따라하는 방법 <ChevronDown size={12} className={open ? "rotate-180" : ""} />
                                </button>
                                {open && (
                                  <div className="mt-2 space-y-2 text-xs text-slate-600">
                                    <ol className="list-decimal space-y-1 pl-4">
                                      {ex.stepsGuide.map((s, i) => (
                                        <li key={i}>{s}</li>
                                      ))}
                                    </ol>
                                    {ex.precautionNote && (
                                      <p className="flex gap-1.5 rounded-lg bg-amber-50 p-2 text-amber-800">
                                        <Info size={13} className="mt-0.5 shrink-0" />
                                        {ex.precautionNote}
                                      </p>
                                    )}
                                  </div>
                                )}
                                <button
                                  type="button"
                                  onClick={() => toggleCheck(a.id)}
                                  className={`mt-3 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-colors ${
                                    done
                                      ? "bg-teal-50 text-teal-700 ring-1 ring-teal-300"
                                      : "bg-teal-600 text-white active:bg-teal-700"
                                  }`}
                                >
                                  {done ? (
                                    <>
                                      <CheckCircle2 size={18} /> 오늘 완료! (눌러서 취소)
                                    </>
                                  ) : (
                                    <>
                                      <Circle size={18} /> 오늘 운동 완료 체크
                                    </>
                                  )}
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
                  <h2 className="px-1 text-sm font-bold text-slate-800">
                    나의 관리 이력 <span className="font-normal text-slate-400">({mySessions.length}회)</span>
                  </h2>
                  {mySessions.length === 0 ? (
                    <p className="rounded-2xl bg-white p-6 text-center text-xs text-slate-400 shadow-sm">
                      아직 관리 이력이 없어요.
                    </p>
                  ) : (
                    mySessions.map((s) => (
                      <article key={s.id} className="rounded-2xl bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                          <b className="text-sm text-slate-900">{s.sessionNumber}회차</b>
                          <span className="text-[11px] text-slate-400">
                            {s.sessionDate} · {s.therapistName}
                          </span>
                        </div>
                        {s.painLevelBefore !== undefined && s.painLevelAfter !== undefined && (
                          <p className="mt-1 text-[11px] text-slate-500">
                            통증 정도 <b className="text-slate-700">{s.painLevelBefore}</b> →{" "}
                            <b className="text-teal-700">{s.painLevelAfter}</b>
                          </p>
                        )}
                        <ul className="mt-2 space-y-1.5">
                          {s.selectedProgramIds.map((id) => {
                            const p = programs.find((x) => x.id === id);
                            return p ? (
                              <li key={id} className="rounded-lg bg-teal-50 p-2 text-xs text-teal-900">
                                <b>{p.title}</b>
                                <br />
                                {p.clientSummaryTemplate}
                              </li>
                            ) : null;
                          })}
                        </ul>
                        {s.clientPublicNote && (
                          <p className="mt-2 rounded-lg bg-slate-50 p-2.5 text-xs leading-relaxed text-slate-700">
                            💬 {s.clientPublicNote}
                          </p>
                        )}
                      </article>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* 모바일 하단 탭 */}
            <nav className="grid grid-cols-2 border-t border-slate-200 bg-white">
              {(
                [
                  ["home", "홈 · 홈운동", Home],
                  ["history", "관리 이력", History],
                ] as const
              ).map(([k, label, Icon]) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setMobileTab(k)}
                  className={`flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-semibold ${
                    mobileTab === k ? "text-teal-700" : "text-slate-400"
                  }`}
                >
                  <Icon size={18} /> {label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}
    </main>
  );
}
