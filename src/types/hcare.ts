/**
 * Hcare CRM 공용 타입 정의 (supabase/schema.sql 과 1:1 대응)
 * camelCase 로 표기하며, Supabase 연동 시 snake_case <-> camelCase 변환 레이어에서 매핑합니다.
 */

export type UserRole = "admin" | "therapist" | "client";

export type ObservationCategory = "경추·어깨" | "흉추·견갑" | "요추·골반" | "하지·보행";

export interface ObservationItem {
  id: string;
  category: ObservationCategory;
  label: string;
  description?: string;
  displayOrder: number;
  isActive: boolean;
}

export interface CareProgram {
  id: string;
  category: string;
  title: string;
  targetMuscles: string[];
  /** [내부용] 수기 관리 테크닉 - 고객 화면 비노출 */
  manualTherapyGuide: string;
  /** [내부용] 주의사항/금기 - 고객 화면 비노출 */
  precautions: string;
  /** [고객 노출용] 이력 화면에 보여줄 친절한 설명 */
  clientSummaryTemplate: string;
  durationMinutes: number;
  isActive: boolean;
}

export interface HomeExercise {
  id: string;
  title: string;
  targetArea: string;
  videoUrl: string;
  thumbnailUrl?: string;
  stepsGuide: string[];
  prescriptionDefault: string;
  precautionNote?: string;
  isActive: boolean;
}

/** 관찰 항목 <-> 관리 프로그램 연결 기준 */
export interface ObservationProgramRule {
  id: string;
  observationId: string;
  programId: string;
  /** 1~5 (5: 최우선 핵심 매칭) */
  priorityWeight: number;
  rationaleNote?: string;
}

export interface ProgramExerciseMap {
  programId: string;
  exerciseId: string;
}

export interface Client {
  id: string;
  branchId: string;
  name: string;
  phone: string;
  birthDate?: string;
  gender?: "F" | "M" | "OTHER";
  occupation?: string;
  consultationNotes?: string;
  preferences?: string;
  precautionsMemo?: string;
  privacyConsent: boolean;
  privacyConsentAt?: string;
  assignedTherapistId?: string;
  createdAt: string;
}

export interface ClientPackage {
  id: string;
  clientId: string;
  packageName: string;
  totalSessions: number;
  usedSessions: number;
  startDate: string;
  expiryDate?: string;
  status: "active" | "completed" | "expired";
}

export interface TreatmentSession {
  id: string;
  branchId: string;
  clientId: string;
  packageId?: string;
  therapistName: string;
  sessionNumber: number;
  sessionDate: string;
  checkedObservationIds: string[];
  selectedProgramIds: string[];
  /** [내부 전용] 고객 절대 비노출 */
  therapistPrivateNote?: string;
  /** [고객 노출] */
  clientPublicNote?: string;
  painLevelBefore?: number;
  painLevelAfter?: number;
}

export interface AssignedExercise {
  id: string;
  sessionId: string;
  clientId: string;
  exerciseId: string;
  customPrescription?: string;
  isActive: boolean;
  assignedAt: string;
}

export interface ExerciseCheckLog {
  id: string;
  assignedExerciseId: string;
  clientId: string;
  /** YYYY-MM-DD */
  checkedDate: string;
  completed: boolean;
  clientFeedback?: string;
}

/** 매칭 엔진 결과 - 추천 프로그램 후보 1건 */
export interface ProgramRecommendation {
  program: CareProgram;
  /** 매칭된 연결 기준 가중치 합 */
  matchScore: number;
  /** 매칭에 기여한 관찰 항목 */
  matchedObservations: { observation: ObservationItem; weight: number; rationaleNote?: string }[];
  /** 프로그램에 기본 연결된 홈운동 */
  recommendedExercises: HomeExercise[];
}

/** 매칭 엔진 전체 결과 */
export interface RecommendationResult {
  recommendations: ProgramRecommendation[];
  /** 중점 타겟 근육 (프로그램 점수 가중 합산 상위순) */
  focusMuscles: { muscle: string; score: number }[];
}

/** 매칭 엔진이 참조하는 데이터 묶음 (향후 AI 교체 시에도 동일 입력 사용) */
export interface MatchingDataset {
  observations: ObservationItem[];
  programs: CareProgram[];
  exercises: HomeExercise[];
  rules: ObservationProgramRule[];
  programExerciseMaps: ProgramExerciseMap[];
}
