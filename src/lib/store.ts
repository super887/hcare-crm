"use client";

/**
 * 데모용 전역 상태 스토어 (Zustand + LocalStorage 영속화)
 *
 * 관리사 / 관리자 / 고객 화면이 하나의 스토어를 공유하므로,
 * 관리사가 회차를 저장하면 고객 화면에 즉시 반영됩니다.
 * Supabase 연동 시 이 스토어의 액션 내부만 DB 호출로 교체하면 화면 코드는 그대로 사용할 수 있습니다.
 */
import { useEffect, useState } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  assignedExercises as seedAssigned,
  clientPackages as seedPackages,
  clients as seedClients,
  demoTherapist,
  exerciseCheckLogs as seedLogs,
  exercises as seedExercises,
  observations as seedObservations,
  programExerciseMaps as seedMaps,
  programs as seedPrograms,
  rules as seedRules,
  sessions as seedSessions,
} from "@/lib/mock-data";
import { getRecommendedPrograms } from "@/lib/matching-engine";
import type {
  AssignedExercise,
  CareProgram,
  Client,
  ClientPackage,
  ExerciseCheckLog,
  HomeExercise,
  MatchingDataset,
  ObservationItem,
  ObservationProgramRule,
  ProgramExerciseMap,
  RecommendationResult,
  TreatmentSession,
  UserRole,
} from "@/types/hcare";

const uid = (prefix: string) =>
  `${prefix}_${typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID().slice(0, 8) : Math.random().toString(36).slice(2, 10)}`;

/** 로컬(KST) 기준 YYYY-MM-DD */
export const todayStr = () => {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
};

export interface SaveSessionInput {
  clientId: string;
  checkedObservationIds: string[];
  selectedProgramIds: string[];
  /** 고객에게 배정할 홈운동 ID */
  exerciseIds: string[];
  therapistPrivateNote?: string;
  clientPublicNote?: string;
  painLevelBefore?: number;
  painLevelAfter?: number;
}

export interface NewClientInput {
  name: string;
  phone: string;
  birthDate?: string;
  gender?: Client["gender"];
  occupation?: string;
  consultationNotes?: string;
  preferences?: string;
  precautionsMemo?: string;
  packageName?: string;
  totalSessions?: number;
}

interface DataState {
  observations: ObservationItem[];
  programs: CareProgram[];
  exercises: HomeExercise[];
  rules: ObservationProgramRule[];
  programExerciseMaps: ProgramExerciseMap[];
  clients: Client[];
  clientPackages: ClientPackage[];
  sessions: TreatmentSession[];
  assignedExercises: AssignedExercise[];
  exerciseCheckLogs: ExerciseCheckLog[];
}

interface UiState {
  /** 데모 모드의 현재 시점 역할 (상단 전환 바) */
  role: UserRole;
  /** 관리사 화면에서 선택된 고객 */
  selectedClientId: string | null;
  /** 고객 화면에서 로그인한 것으로 가정하는 고객 */
  currentClientId: string;
}

interface Actions {
  setRole: (role: UserRole) => void;
  selectClient: (id: string | null) => void;
  setCurrentClient: (id: string) => void;

  // 고객 / 회차
  addClient: (input: NewClientInput) => Client;
  updateClient: (id: string, patch: Partial<Client>) => void;
  saveSession: (input: SaveSessionInput) => TreatmentSession;

  // 고객 홈운동 수행 체크 (이미 체크된 날짜면 해제)
  toggleExerciseCheck: (assignedExerciseId: string, date?: string, feedback?: string) => void;

  // 관리자: 관찰 항목
  upsertObservation: (item: Omit<ObservationItem, "id"> & { id?: string }) => void;
  toggleObservationActive: (id: string) => void;
  // 관리자: 프로그램 / 홈운동
  upsertProgram: (item: Omit<CareProgram, "id"> & { id?: string }) => void;
  toggleProgramActive: (id: string) => void;
  upsertExercise: (item: Omit<HomeExercise, "id"> & { id?: string }) => void;
  toggleExerciseActive: (id: string) => void;
  // 관리자: 연결 기준 / 프로그램-홈운동 연결
  setRule: (observationId: string, programId: string, weight: number | null, rationaleNote?: string) => void;
  toggleProgramExercise: (programId: string, exerciseId: string) => void;

  resetDemo: () => void;
}

export type HcareState = DataState & UiState & Actions;

const seedData = (): DataState => ({
  observations: structuredClone(seedObservations),
  programs: structuredClone(seedPrograms),
  exercises: structuredClone(seedExercises),
  rules: structuredClone(seedRules),
  programExerciseMaps: structuredClone(seedMaps),
  clients: structuredClone(seedClients),
  clientPackages: structuredClone(seedPackages),
  sessions: structuredClone(seedSessions),
  assignedExercises: structuredClone(seedAssigned),
  exerciseCheckLogs: structuredClone(seedLogs),
});

const seedUi = (): UiState => ({
  role: "therapist",
  selectedClientId: seedClients[0]?.id ?? null,
  currentClientId: seedClients[0]?.id ?? "",
});

export const useHcareStore = create<HcareState>()(
  persist(
    (set, get) => ({
      ...seedData(),
      ...seedUi(),

      setRole: (role) => set({ role }),
      selectClient: (id) => set({ selectedClientId: id }),
      setCurrentClient: (id) => set({ currentClientId: id }),

      addClient: (input) => {
        const now = new Date().toISOString();
        const client: Client = {
          id: uid("client"),
          branchId: "main",
          name: input.name,
          phone: input.phone,
          birthDate: input.birthDate,
          gender: input.gender,
          occupation: input.occupation,
          consultationNotes: input.consultationNotes,
          preferences: input.preferences,
          precautionsMemo: input.precautionsMemo,
          privacyConsent: true,
          privacyConsentAt: now,
          assignedTherapistId: demoTherapist.id,
          createdAt: now,
        };
        const pkg: ClientPackage = {
          id: uid("pkg"),
          clientId: client.id,
          packageName: input.packageName?.trim() || "기본 케어 10회권",
          totalSessions: input.totalSessions && input.totalSessions > 0 ? input.totalSessions : 10,
          usedSessions: 0,
          startDate: todayStr(),
          status: "active",
        };
        set((s) => ({
          clients: [client, ...s.clients],
          clientPackages: [pkg, ...s.clientPackages],
          selectedClientId: client.id,
        }));
        return client;
      },

      updateClient: (id, patch) =>
        set((s) => ({ clients: s.clients.map((c) => (c.id === id ? { ...c, ...patch } : c)) })),

      saveSession: (input) => {
        const s = get();
        const pkg = s.clientPackages.find((p) => p.clientId === input.clientId && p.status === "active");
        const prevSessions = s.sessions.filter((x) => x.clientId === input.clientId);
        const session: TreatmentSession = {
          id: uid("sess"),
          branchId: "main",
          clientId: input.clientId,
          packageId: pkg?.id,
          therapistName: demoTherapist.name,
          sessionNumber: prevSessions.length + 1,
          sessionDate: todayStr(),
          checkedObservationIds: input.checkedObservationIds,
          selectedProgramIds: input.selectedProgramIds,
          therapistPrivateNote: input.therapistPrivateNote,
          clientPublicNote: input.clientPublicNote,
          painLevelBefore: input.painLevelBefore,
          painLevelAfter: input.painLevelAfter,
        };
        const nowIso = new Date().toISOString();
        // 새 회차가 기존 배정을 대체 (이전 배정은 비활성)
        const newAssigned: AssignedExercise[] = input.exerciseIds.map((exerciseId) => ({
          id: uid("ae"),
          sessionId: session.id,
          clientId: input.clientId,
          exerciseId,
          isActive: true,
          assignedAt: nowIso,
        }));
        set((st) => ({
          sessions: [...st.sessions, session],
          clientPackages: st.clientPackages.map((p) => {
            if (p.id !== pkg?.id) return p;
            const used = Math.min(p.totalSessions, p.usedSessions + 1);
            return { ...p, usedSessions: used, status: used >= p.totalSessions ? "completed" : p.status };
          }),
          assignedExercises: [
            ...st.assignedExercises.map((a) =>
              a.clientId === input.clientId && newAssigned.length > 0 ? { ...a, isActive: false } : a,
            ),
            ...newAssigned,
          ],
        }));
        return session;
      },

      toggleExerciseCheck: (assignedExerciseId, date = todayStr(), feedback) =>
        set((s) => {
          const assigned = s.assignedExercises.find((a) => a.id === assignedExerciseId);
          if (!assigned) return s;
          const existing = s.exerciseCheckLogs.find(
            (l) => l.assignedExerciseId === assignedExerciseId && l.checkedDate === date,
          );
          if (existing) {
            return { exerciseCheckLogs: s.exerciseCheckLogs.filter((l) => l.id !== existing.id) };
          }
          const log: ExerciseCheckLog = {
            id: uid("log"),
            assignedExerciseId,
            clientId: assigned.clientId,
            checkedDate: date,
            completed: true,
            clientFeedback: feedback,
          };
          return { exerciseCheckLogs: [...s.exerciseCheckLogs, log] };
        }),

      upsertObservation: (item) =>
        set((s) => {
          if (item.id && s.observations.some((o) => o.id === item.id)) {
            return { observations: s.observations.map((o) => (o.id === item.id ? { ...o, ...item, id: o.id } : o)) };
          }
          const order = Math.max(0, ...s.observations.map((o) => o.displayOrder)) + 1;
          const created: ObservationItem = { ...item, id: item.id ?? uid("obs"), displayOrder: item.displayOrder || order };
          return { observations: [...s.observations, created] };
        }),
      toggleObservationActive: (id) =>
        set((s) => ({ observations: s.observations.map((o) => (o.id === id ? { ...o, isActive: !o.isActive } : o)) })),

      upsertProgram: (item) =>
        set((s) => {
          if (item.id && s.programs.some((p) => p.id === item.id)) {
            return { programs: s.programs.map((p) => (p.id === item.id ? { ...p, ...item, id: p.id } : p)) };
          }
          return { programs: [...s.programs, { ...item, id: item.id ?? uid("prog") }] };
        }),
      toggleProgramActive: (id) =>
        set((s) => ({ programs: s.programs.map((p) => (p.id === id ? { ...p, isActive: !p.isActive } : p)) })),

      upsertExercise: (item) =>
        set((s) => {
          if (item.id && s.exercises.some((e) => e.id === item.id)) {
            return { exercises: s.exercises.map((e) => (e.id === item.id ? { ...e, ...item, id: e.id } : e)) };
          }
          return { exercises: [...s.exercises, { ...item, id: item.id ?? uid("ex") }] };
        }),
      toggleExerciseActive: (id) =>
        set((s) => ({ exercises: s.exercises.map((e) => (e.id === id ? { ...e, isActive: !e.isActive } : e)) })),

      setRule: (observationId, programId, weight, rationaleNote) =>
        set((s) => {
          const others = s.rules.filter((r) => !(r.observationId === observationId && r.programId === programId));
          if (weight === null) return { rules: others };
          const prev = s.rules.find((r) => r.observationId === observationId && r.programId === programId);
          const next: ObservationProgramRule = {
            id: prev?.id ?? uid("rule"),
            observationId,
            programId,
            priorityWeight: Math.min(5, Math.max(1, Math.round(weight))),
            rationaleNote: rationaleNote ?? prev?.rationaleNote,
          };
          return { rules: [...others, next] };
        }),

      toggleProgramExercise: (programId, exerciseId) =>
        set((s) => {
          const exists = s.programExerciseMaps.some((m) => m.programId === programId && m.exerciseId === exerciseId);
          return {
            programExerciseMaps: exists
              ? s.programExerciseMaps.filter((m) => !(m.programId === programId && m.exerciseId === exerciseId))
              : [...s.programExerciseMaps, { programId, exerciseId }],
          };
        }),

      resetDemo: () => set({ ...seedData(), ...seedUi() }),
    }),
    {
      name: "hcare-demo-store-v1",
      storage: createJSONStorage(() => localStorage),
      version: 1,
      skipHydration: true,
      // 액션은 직렬화되지 않으므로 데이터/UI만 저장
      partialize: (s) => ({
        observations: s.observations,
        programs: s.programs,
        exercises: s.exercises,
        rules: s.rules,
        programExerciseMaps: s.programExerciseMaps,
        clients: s.clients,
        clientPackages: s.clientPackages,
        sessions: s.sessions,
        assignedExercises: s.assignedExercises,
        exerciseCheckLogs: s.exerciseCheckLogs,
        role: s.role,
        selectedClientId: s.selectedClientId,
        currentClientId: s.currentClientId,
      }),
    },
  ),
);

/**
 * LocalStorage 복원 완료 여부 훅 (SSR/클라이언트 hydration 불일치 방지).
 * 화면 최상단에서 `const hydrated = useHydrated(); if (!hydrated) return <Loading/>` 형태로 사용합니다.
 */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    void Promise.resolve(useHcareStore.persist.rehydrate()).then(() => setHydrated(true));
  }, []);
  return hydrated;
}

/** 현재 스토어 데이터를 매칭 엔진 입력 형태로 변환 */
export const selectMatchingDataset = (s: DataState): MatchingDataset => ({
  observations: s.observations,
  programs: s.programs,
  exercises: s.exercises,
  rules: s.rules,
  programExerciseMaps: s.programExerciseMaps,
});

/** 편의 함수: 스토어 상태 + 체크된 관찰 항목 -> 추천 결과 (UI에서 useMemo 와 함께 사용) */
export const computeRecommendations = (s: DataState, observationIds: string[]): RecommendationResult =>
  getRecommendedPrograms(observationIds, selectMatchingDataset(s));
