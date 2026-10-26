/**
 * 데모용 샘플 데이터 (예시 데이터입니다. 실제 서비스에서는 관리자 화면에서 대표님이 직접 입력·수정합니다.)
 * 임상 내용은 시연을 위한 일반적인 수준의 예시이며, 의학적 판단 기준이 아닙니다.
 */
import type {
  AssignedExercise,
  CareProgram,
  Client,
  ClientPackage,
  ExerciseCheckLog,
  HomeExercise,
  ObservationItem,
  ObservationProgramRule,
  ProgramExerciseMap,
  TreatmentSession,
} from "@/types/hcare";

const yt = (q: string) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;

// ---------------------------------------------------------------------------
// 관찰 항목 (4개 카테고리 × 3~4개 = 14개)
// ---------------------------------------------------------------------------
export const observations: ObservationItem[] = [
  // 경추·어깨
  { id: "obs_neck_rot_pain", category: "경추·어깨", label: "고개 좌우 회전 시 통증·당김", description: "좌우 회전 가동범위(약 70~80°) 및 끝범위 통증 확인", displayOrder: 1, isActive: true },
  { id: "obs_forward_head", category: "경추·어깨", label: "거북목 (전방 두부 자세)", description: "측면에서 귀 구멍이 어깨 중심보다 앞쪽에 위치", displayOrder: 2, isActive: true },
  { id: "obs_shoulder_elev", category: "경추·어깨", label: "어깨 올림·승모근 뻐근함", description: "양측 어깨 높이 비대칭, 상부승모근 촉진 시 긴장", displayOrder: 3, isActive: true },
  { id: "obs_arm_raise_limit", category: "경추·어깨", label: "팔 들어올릴 때 어깨 걸림", description: "굴곡/외전 시 중간범위 통증 호(arc) 확인", displayOrder: 4, isActive: true },
  // 흉추·견갑
  { id: "obs_round_shoulder", category: "흉추·견갑", label: "라운드숄더 (어깨 말림)", description: "벽 서기 검사 시 어깨 뒤쪽이 벽에 닿지 않음", displayOrder: 5, isActive: true },
  { id: "obs_winged_scapula", category: "흉추·견갑", label: "견갑골 들림 (익상견갑)", description: "푸시업/벽 밀기 시 견갑골 내측연이 뜸", displayOrder: 6, isActive: true },
  { id: "obs_thoracic_stiff", category: "흉추·견갑", label: "등 위쪽 뻣뻣함 (흉추 가동성 저하)", description: "앉아서 몸통 회전 시 좌우 제한 비교", displayOrder: 7, isActive: true },
  // 요추·골반
  { id: "obs_low_back_tight", category: "요추·골반", label: "허리 뻐근함 (오래 앉은 후)", description: "장시간 앉은 뒤 기립 시 허리 뻣뻣함", displayOrder: 8, isActive: true },
  { id: "obs_anterior_tilt", category: "요추·골반", label: "골반 전방경사 (허리 과전만)", description: "측면에서 ASIS가 PSIS보다 현저히 낮음", displayOrder: 9, isActive: true },
  { id: "obs_pelvic_asym", category: "요추·골반", label: "골반 좌우 높이 비대칭", description: "양측 장골능 높이 비교, 한쪽 다리 체중 의존", displayOrder: 10, isActive: true },
  // 하지·보행
  { id: "obs_hip_tight", category: "하지·보행", label: "엉덩이·고관절 뻐근함", description: "이상근/둔근 촉진 시 압통, 4자 다리 검사 제한", displayOrder: 11, isActive: true },
  { id: "obs_hamstring_tight", category: "하지·보행", label: "햄스트링 짧음 (앞으로 숙이기 어려움)", description: "SLR 70° 미만 또는 서서 숙이기 시 손끝-바닥 거리", displayOrder: 12, isActive: true },
  { id: "obs_calf_tight", category: "하지·보행", label: "종아리 당김·발목 뻣뻣함", description: "발목 배측굴곡 제한, 쪼그려 앉기 시 뒤꿈치 뜸", displayOrder: 13, isActive: true },
  { id: "obs_knee_valgus", category: "하지·보행", label: "스쿼트 시 무릎 안쪽 쏠림", description: "한발/양발 스쿼트 시 무릎이 안쪽으로 모임", displayOrder: 14, isActive: true },
];

// ---------------------------------------------------------------------------
// 관리 프로그램 (8개)
// ---------------------------------------------------------------------------
export const programs: CareProgram[] = [
  {
    id: "prog_cervical_release",
    category: "상체/경추",
    title: "경추 회전근 & 견갑거근 이완 케어",
    targetMuscles: ["견갑거근", "상부승모근", "흉쇄유돌근", "두판상근"],
    manualTherapyGuide:
      "1) 앙와위에서 후두하근 이완(부드러운 지속 압박 60~90초)\n2) 견갑거근 정지부(견갑골 상각) 압통점 지속 압박 후 경추 반대측 측굴 스트레칭\n3) 흉쇄유돌근은 집게 잡기 대신 부드러운 길이 늘리기 위주로 진행\n4) 마무리: 경추 능동 회전 가동범위 재평가",
    precautions: "어지러움·팔 저림·방사통이 있으면 즉시 중단. 급성 외상(교통사고 등) 직후에는 적용 금지. 경동맥 부위 직접 압박 금지.",
    clientSummaryTemplate: "목 옆과 어깨 위쪽의 긴장된 근육을 부드럽게 풀어 고개 돌림이 편해지도록 관리했습니다.",
    durationMinutes: 50,
    isActive: true,
  },
  {
    id: "prog_upper_trap_release",
    category: "상체/경추",
    title: "상부승모근 긴장 완화 & 어깨 순환 케어",
    targetMuscles: ["상부승모근", "견갑거근", "사각근"],
    manualTherapyGuide:
      "1) 온열 적용 5분 후 상부승모근 광범위 이완(롤링 → 지속 압박)\n2) 사각근 스칼렌 부위는 얕은 압으로 호흡 동조하여 이완\n3) 어깨 하강 보조 스트레칭 3회 × 30초\n4) 호흡(복식) 코칭 포함",
    precautions: "흉곽출구증후군 의심(팔 저림·냉감) 시 사각근 직접 압박 금지. 고혈압 고객은 압강도 낮게 시작.",
    clientSummaryTemplate: "올라간 어깨와 뻐근한 승모근을 풀고 호흡으로 긴장을 낮추는 관리를 받으셨습니다.",
    durationMinutes: 50,
    isActive: true,
  },
  {
    id: "prog_chest_opening",
    category: "어깨/견갑",
    title: "소흉근·가슴 열기 & 라운드숄더 교정 케어",
    targetMuscles: ["소흉근", "대흉근", "전거근", "능형근", "하부승모근"],
    manualTherapyGuide:
      "1) 소흉근(오구돌기 아래) 얕은 압 → 깊은 지속 압박, 팔 외회전 병행\n2) 대흉근 근막 이완 후 도어웨이 스트레칭 보조\n3) 능형근·하부승모근 활성화를 위한 가벼운 저항 로우 코칭\n4) 흉추 신전 가동술 연계",
    precautions: "견관절 불안정 병력(탈구 경험) 시 외전·외회전 가동범위 제한. 겨드랑이 림프 부위 강한 압박 금지.",
    clientSummaryTemplate: "앞으로 말린 가슴 근육을 늘리고 등 근육을 깨워 어깨 자세를 바르게 하는 관리를 했습니다.",
    durationMinutes: 60,
    isActive: true,
  },
  {
    id: "prog_scapular_stabilization",
    category: "어깨/견갑",
    title: "견갑 안정화 & 전거근 활성화 프로그램",
    targetMuscles: ["전거근", "하부승모근", "중부승모근", "극하근"],
    manualTherapyGuide:
      "1) 전거근 촉진·피부 자극으로 인지 향상\n2) 견갑골 위치 보정 후 벽 슬라이드 동작 지도\n3) 소도구(밴드) 저강도 로우/외회전 지도\n4) 관리 후 견갑 위치 재확인",
    precautions: "회전근개 파열 의심 시(야간통, 팔 들기 불가) 운동 강도 상승 금지, 전문의 협진 권고.",
    clientSummaryTemplate: "견갑골을 안정적으로 잡아주는 근육을 깨우고 올바른 어깨 움직임을 연습했습니다.",
    durationMinutes: 50,
    isActive: true,
  },
  {
    id: "prog_thoracic_mobility",
    category: "흉추/등",
    title: "흉추 가동성 개선 & 척추기립근 이완 케어",
    targetMuscles: ["척추기립근(흉추부)", "다열근", "능형근", "광배근"],
    manualTherapyGuide:
      "1) 폼롤러/손 지지 흉추 신전 가동술 (호흡 동조 5~8회)\n2) 척추기립근 평행 스트로크 후 지속 압박\n3) 앉은 자세 몸통 회전 스트레칭 보조\n4) 광배근 길이 늘리기(옆누워 팔 올리기)",
    precautions: "골다공증·압박골절 병력이 있으면 압박성 가동술 금지. 늑골 통증 시 강한 신전 금지.",
    clientSummaryTemplate: "뻣뻣한 등 위쪽 관절과 주변 근육을 풀어 숨쉬기와 몸통 회전이 편해지도록 도왔습니다.",
    durationMinutes: 50,
    isActive: true,
  },
  {
    id: "prog_lumbar_decompress",
    category: "코어/골반",
    title: "요방형근·요추기립근 이완 & 코어 호흡 케어",
    targetMuscles: ["요방형근", "요추기립근", "장요근", "복횡근"],
    manualTherapyGuide:
      "1) 옆누워 요방형근 이완 + 골반 하강 스트레칭\n2) 요추기립근 이완 후 장요근 간접 이완(무릎 가슴 당기기 보조)\n3) 복식호흡 + 복횡근 활성화 코칭(드로잉인)\n4) 앉기·서기 자세 교육",
    precautions: "하지 방사통·감각 저하·배뇨 이상이 있으면 즉시 중단하고 의료기관 진료 권고. 급성기 디스크 의심 시 굴곡 위주 운동 제한.",
    clientSummaryTemplate: "허리 주변 근육을 풀고 배 속 근육(코어) 호흡을 연습해 허리 부담을 줄이는 관리를 했습니다.",
    durationMinutes: 60,
    isActive: true,
  },
  {
    id: "prog_pelvic_balance",
    category: "코어/골반",
    title: "골반 균형 조정 & 대둔근·중둔근 활성화",
    targetMuscles: ["대둔근", "중둔근", "이상근", "대퇴근막장근", "장요근"],
    manualTherapyGuide:
      "1) 장요근·대퇴직근 단축 측 이완 (전방경사 시 양측)\n2) 이상근/둔근 압통점 지속 압박\n3) 중둔근 활성화(클램쉘, 브리지) 코칭\n4) 비대칭 시 단축측-약화측 구분하여 관리 강도 차등",
    precautions: "고관절 수술/인공관절 이력 시 내회전·굴곡 90° 이상 금지. 좌골신경 주행 부위 직접 강압 금지.",
    clientSummaryTemplate: "기울어진 골반 균형을 맞추고 엉덩이 근육을 단단하게 쓸 수 있도록 관리와 운동을 진행했습니다.",
    durationMinutes: 60,
    isActive: true,
  },
  {
    id: "prog_hip_hamstring",
    category: "하지 순환",
    title: "고관절·햄스트링 유연성 & 하지 순환 케어",
    targetMuscles: ["햄스트링", "이상근", "대둔근", "내전근"],
    manualTherapyGuide:
      "1) 햄스트링 근복 롤링 후 PNF(수축-이완) 스트레칭 3회\n2) 이상근 지속 압박 + 4자 스트레칭 보조\n3) 하지 림프 순환 마사지(말단→근위)\n4) 마무리 고관절 가동범위 재평가",
    precautions: "햄스트링 부분 파열 이력 시 강한 스트레칭 금지. 하지 정맥류·혈전 병력 시 림프 마사지 압 최소화.",
    clientSummaryTemplate: "엉덩이와 허벅지 뒤쪽을 길게 늘리고 다리 순환을 도와 하체가 가벼워지도록 관리했습니다.",
    durationMinutes: 50,
    isActive: true,
  },
  {
    id: "prog_calf_ankle",
    category: "하지 순환",
    title: "종아리·발목 가동성 & 무릎 정렬 케어",
    targetMuscles: ["비복근", "가자미근", "후경골근", "중둔근", "내측광근"],
    manualTherapyGuide:
      "1) 비복근·가자미근 깊은 압박 + 발목 배측굴곡 가동술\n2) 후경골근/아치 지지 근육 관리\n3) 스쿼트 정렬 교정 코칭(무릎-발끝 정렬, 중둔근 활성화)\n4) 보행·신발 상담",
    precautions: "아킬레스건염 급성기에는 강한 스트레칭 금지. 종아리 붓기+열감+통증 시 혈전 가능성 확인(마사지 중단).",
    clientSummaryTemplate: "종아리와 발목을 부드럽게 풀고 무릎이 바른 방향으로 움직이도록 연습을 도와드렸습니다.",
    durationMinutes: 50,
    isActive: true,
  },
];

// ---------------------------------------------------------------------------
// 홈운동 (7개) - 영상 링크는 데모용 검색 링크 (실제 서비스에서는 관리자가 영상 URL 등록)
// ---------------------------------------------------------------------------
export const exercises: HomeExercise[] = [
  {
    id: "ex_chin_tuck_wall",
    title: "벽 기대어 턱 당기기 (친턱)",
    targetArea: "목·어깨 안정화",
    videoUrl: yt("wall chin tuck exercise"),
    stepsGuide: ["벽에 등과 뒤통수를 가볍게 붙이고 선다", "시선은 정면, 턱을 뒤로 수평으로 당긴다", "5초 유지 후 천천히 풀어준다", "어깨가 올라가지 않게 주의한다"],
    prescriptionDefault: "5초 유지 × 10회 / 하루 2세트",
    precautionNote: "어지럽거나 팔이 저리면 즉시 중단하세요.",
    isActive: true,
  },
  {
    id: "ex_levator_stretch",
    title: "견갑거근 스트레칭 (대각선 숙이기)",
    targetArea: "목 옆·어깨 위",
    videoUrl: yt("levator scapulae stretch"),
    stepsGuide: ["의자에 앉아 한 손으로 의자 밑을 잡는다", "반대쪽 대각선 아래(겨드랑이 방향)로 고개를 숙인다", "당겨지는 느낌에서 30초 유지", "반대쪽도 동일하게 반복"],
    prescriptionDefault: "30초 × 좌우 각 2회 / 하루 2~3회",
    precautionNote: "통증이 아닌 시원한 당김 정도까지만 하세요.",
    isActive: true,
  },
  {
    id: "ex_doorway_chest",
    title: "도어웨이 가슴 스트레칭",
    targetArea: "가슴·어깨 앞쪽",
    videoUrl: yt("doorway pec stretch"),
    stepsGuide: ["문틀에 팔꿈치를 90°로 구부려 올린다", "한 발을 앞으로 내딛어 가슴을 앞으로 연다", "가슴 앞이 늘어나는 느낌에서 30초 유지", "허리가 꺾이지 않게 복부에 힘을 준다"],
    prescriptionDefault: "30초 × 3회 / 하루 2세트",
    precautionNote: "어깨 앞쪽에 찌릿한 통증이 있으면 팔 높이를 낮추세요.",
    isActive: true,
  },
  {
    id: "ex_wall_slide",
    title: "벽 슬라이드 (견갑 안정화)",
    targetArea: "견갑·어깨 안정화",
    videoUrl: yt("wall slide scapular exercise"),
    stepsGuide: ["벽에 등을 붙이고 팔꿈치와 손등을 벽에 댄다", "어깨를 내린 채 팔을 위로 천천히 밀어 올린다", "내려올 때도 천천히 조절한다", "허리가 뜨지 않게 유지한다"],
    prescriptionDefault: "10회 × 2세트 / 하루 1~2회",
    precautionNote: "어깨 앞 걸림이 있으면 가동범위를 줄이세요.",
    isActive: true,
  },
  {
    id: "ex_thoracic_rotation",
    title: "누워서 흉추 회전 (오픈북)",
    targetArea: "등 위쪽 가동성",
    videoUrl: yt("open book thoracic rotation"),
    stepsGuide: ["옆으로 누워 무릎을 90°로 모은다", "양팔을 앞으로 모은 뒤 위쪽 팔을 천천히 펼쳐 뒤로 연다", "시선은 손을 따라간다", "숨을 내쉬며 천천히 돌아온다"],
    prescriptionDefault: "좌우 각 8회 / 하루 1~2세트",
    precautionNote: "무릎이 벌어지지 않게 하세요.",
    isActive: true,
  },
  {
    id: "ex_hip_bridge_clam",
    title: "브리지 + 클램쉘 (엉덩이 활성화)",
    targetArea: "엉덩이·골반 안정화",
    videoUrl: yt("glute bridge clamshell"),
    stepsGuide: ["무릎을 세우고 누워 엉덩이를 천천히 들어 올린다 (10회)", "옆으로 누워 무릎을 모은 채 위쪽 무릎만 연다 (좌우 15회)", "허리가 아닌 엉덩이로 힘을 쓰는 느낌에 집중한다"],
    prescriptionDefault: "브리지 10회 + 클램쉘 좌우 15회 / 하루 1세트",
    precautionNote: "허리가 꺾이거나 통증이 있으면 범위를 줄이세요.",
    isActive: true,
  },
  {
    id: "ex_hamstring_calf_stretch",
    title: "햄스트링·종아리 스트레칭 (수건 이용)",
    targetArea: "허벅지 뒤·종아리",
    videoUrl: yt("hamstring stretch with towel"),
    stepsGuide: ["누워서 한쪽 발바닥에 수건을 건다", "무릎을 편 채 다리를 천장 방향으로 당긴다", "허벅지 뒤가 당기는 지점에서 30초 유지", "발끝을 몸쪽으로 당기면 종아리도 함께 늘어난다"],
    prescriptionDefault: "30초 × 좌우 각 2회 / 하루 1~2회",
    precautionNote: "무릎 뒤쪽이 꺾이거나 저리면 정도를 줄이세요.",
    isActive: true,
  },
];

// ---------------------------------------------------------------------------
// 관리 프로그램 <-> 기본 홈운동 연결
// ---------------------------------------------------------------------------
export const programExerciseMaps: ProgramExerciseMap[] = [
  { programId: "prog_cervical_release", exerciseId: "ex_chin_tuck_wall" },
  { programId: "prog_cervical_release", exerciseId: "ex_levator_stretch" },
  { programId: "prog_upper_trap_release", exerciseId: "ex_levator_stretch" },
  { programId: "prog_upper_trap_release", exerciseId: "ex_chin_tuck_wall" },
  { programId: "prog_chest_opening", exerciseId: "ex_doorway_chest" },
  { programId: "prog_chest_opening", exerciseId: "ex_wall_slide" },
  { programId: "prog_scapular_stabilization", exerciseId: "ex_wall_slide" },
  { programId: "prog_thoracic_mobility", exerciseId: "ex_thoracic_rotation" },
  { programId: "prog_lumbar_decompress", exerciseId: "ex_hip_bridge_clam" },
  { programId: "prog_pelvic_balance", exerciseId: "ex_hip_bridge_clam" },
  { programId: "prog_hip_hamstring", exerciseId: "ex_hamstring_calf_stretch" },
  { programId: "prog_calf_ankle", exerciseId: "ex_hamstring_calf_stretch" },
  { programId: "prog_calf_ankle", exerciseId: "ex_hip_bridge_clam" },
];

// ---------------------------------------------------------------------------
// 관찰 항목 <-> 프로그램 연결 기준 (가중치 1~5)
// ---------------------------------------------------------------------------
let ruleSeq = 0;
const rule = (observationId: string, programId: string, priorityWeight: number, rationaleNote?: string): ObservationProgramRule => ({
  id: `rule_${++ruleSeq}`,
  observationId,
  programId,
  priorityWeight,
  rationaleNote,
});

export const rules: ObservationProgramRule[] = [
  // 고개 회전 통증
  rule("obs_neck_rot_pain", "prog_cervical_release", 5, "회전 제한 시 동측 견갑거근·반대측 흉쇄유돌근 단축 확인"),
  rule("obs_neck_rot_pain", "prog_upper_trap_release", 3, "상부승모근 과긴장 동반 빈번"),
  rule("obs_neck_rot_pain", "prog_thoracic_mobility", 2, "흉추 회전 제한이 경추 보상을 유발"),
  // 거북목
  rule("obs_forward_head", "prog_cervical_release", 4, "후두하근·견갑거근 단축"),
  rule("obs_forward_head", "prog_chest_opening", 4, "소흉근 단축·흉추 후만 동반"),
  rule("obs_forward_head", "prog_thoracic_mobility", 3, "흉추 신전 가동성 회복 필요"),
  // 어깨 올림
  rule("obs_shoulder_elev", "prog_upper_trap_release", 5, "상부승모근 과긴장의 직접 지표"),
  rule("obs_shoulder_elev", "prog_cervical_release", 3, "견갑거근 동반 긴장"),
  rule("obs_shoulder_elev", "prog_scapular_stabilization", 2, "하부승모근·전거근 약화 보상"),
  // 팔 들기 걸림
  rule("obs_arm_raise_limit", "prog_scapular_stabilization", 5, "견갑상완 리듬 이상 평가·교정"),
  rule("obs_arm_raise_limit", "prog_chest_opening", 3, "소흉근 단축으로 견갑 후방경사 제한"),
  rule("obs_arm_raise_limit", "prog_thoracic_mobility", 3, "흉추 신전 제한 시 팔 거상 제한"),
  // 라운드숄더
  rule("obs_round_shoulder", "prog_chest_opening", 5, "소흉근·대흉근 단축이 핵심"),
  rule("obs_round_shoulder", "prog_scapular_stabilization", 4, "능형근·하부승모근 약화"),
  rule("obs_round_shoulder", "prog_thoracic_mobility", 3, "흉추 후만 교정 병행"),
  // 익상견갑
  rule("obs_winged_scapula", "prog_scapular_stabilization", 5, "전거근 활성화 필요"),
  rule("obs_winged_scapula", "prog_chest_opening", 2, "소흉근 단축이 익상견갑 악화"),
  // 흉추 뻣뻣함
  rule("obs_thoracic_stiff", "prog_thoracic_mobility", 5, "흉추 가동성 직접 개선"),
  rule("obs_thoracic_stiff", "prog_chest_opening", 2, "흉곽 앞쪽 단축 연관"),
  rule("obs_thoracic_stiff", "prog_lumbar_decompress", 2, "흉요추 이행부 보상 경감"),
  // 허리 뻐근
  rule("obs_low_back_tight", "prog_lumbar_decompress", 5, "요방형근·요추기립근 과긴장"),
  rule("obs_low_back_tight", "prog_pelvic_balance", 3, "골반 정렬 문제 동반"),
  rule("obs_low_back_tight", "prog_hip_hamstring", 2, "고관절·햄스트링 단축이 허리 부담 유발"),
  // 골반 전방경사
  rule("obs_anterior_tilt", "prog_pelvic_balance", 5, "장요근 단축·대둔근 약화"),
  rule("obs_anterior_tilt", "prog_lumbar_decompress", 4, "요추 과전만에 따른 기립근 긴장"),
  rule("obs_anterior_tilt", "prog_hip_hamstring", 2, "대퇴 전·후면 균형 조정"),
  // 골반 비대칭
  rule("obs_pelvic_asym", "prog_pelvic_balance", 5, "단축측/약화측 구분 관리"),
  rule("obs_pelvic_asym", "prog_lumbar_decompress", 3, "요방형근 좌우 긴장 차이"),
  rule("obs_pelvic_asym", "prog_hip_hamstring", 2, "이상근 좌우 차이"),
  // 엉덩이 뻐근
  rule("obs_hip_tight", "prog_hip_hamstring", 5, "이상근·대둔근 이완"),
  rule("obs_hip_tight", "prog_pelvic_balance", 4, "중둔근·대둔근 균형"),
  // 햄스트링
  rule("obs_hamstring_tight", "prog_hip_hamstring", 5, "햄스트링 길이 확보"),
  rule("obs_hamstring_tight", "prog_lumbar_decompress", 2, "후방 사슬 긴장이 허리 굴곡 제한"),
  // 종아리
  rule("obs_calf_tight", "prog_calf_ankle", 5, "비복근·가자미근 이완 및 발목 가동"),
  rule("obs_calf_tight", "prog_hip_hamstring", 2, "후방 근막선 연결"),
  // 무릎 안쪽 쏠림
  rule("obs_knee_valgus", "prog_calf_ankle", 4, "발목 가동성 제한이 무릎 정렬에 영향"),
  rule("obs_knee_valgus", "prog_pelvic_balance", 4, "중둔근 약화가 주요 원인"),
];

// ---------------------------------------------------------------------------
// 고객 / 패키지 / 회차 기록 / 홈운동 배정 샘플
// ---------------------------------------------------------------------------
export const clients: Client[] = [
  {
    id: "client_1",
    branchId: "main",
    name: "김서연",
    phone: "010-1111-2222",
    birthDate: "1991-04-12",
    gender: "F",
    occupation: "사무직 (하루 9시간 이상 모니터 작업)",
    consultationNotes: "2개월 전부터 고개를 돌릴 때 오른쪽 목 옆이 당기고 어깨가 항상 뭉쳐 있음. 두통 동반 가끔.",
    preferences: "압은 중간 이하 선호, 온열 적용 선호",
    precautionsMemo: "편두통 이력. 경추 급격한 신전 금지.",
    privacyConsent: true,
    privacyConsentAt: "2026-09-28T10:00:00+09:00",
    assignedTherapistId: "therapist_1",
    createdAt: "2026-09-28T10:00:00+09:00",
  },
  {
    id: "client_2",
    branchId: "main",
    name: "박지훈",
    phone: "010-3333-4444",
    birthDate: "1986-11-03",
    gender: "M",
    occupation: "개발자 / 주 3회 헬스",
    consultationNotes: "라운드숄더와 어깨 앞쪽 뻐근함. 벤치프레스 후 팔 들기 어색함.",
    preferences: "강한 압 선호, 운동 지도 적극 희망",
    precautionsMemo: "과거 왼쪽 어깨 탈구 1회.",
    privacyConsent: true,
    privacyConsentAt: "2026-10-02T14:00:00+09:00",
    assignedTherapistId: "therapist_1",
    createdAt: "2026-10-02T14:00:00+09:00",
  },
  {
    id: "client_3",
    branchId: "main",
    name: "이민정",
    phone: "010-5555-6666",
    birthDate: "1979-07-21",
    gender: "F",
    occupation: "초등학교 교사 (서서 수업)",
    consultationNotes: "오래 서 있으면 허리와 종아리가 당김. 골반이 한쪽으로 기운 느낌.",
    preferences: "부드러운 압, 마무리 림프 순환 선호",
    precautionsMemo: "하지정맥류 가벼운 이력 - 종아리 강압 금지.",
    privacyConsent: true,
    privacyConsentAt: "2026-10-05T11:30:00+09:00",
    assignedTherapistId: "therapist_1",
    createdAt: "2026-10-05T11:30:00+09:00",
  },
  {
    id: "client_4",
    branchId: "main",
    name: "최영호",
    phone: "010-7777-8888",
    birthDate: "1995-01-30",
    gender: "M",
    occupation: "배달 라이더",
    consultationNotes: "장시간 오토바이 운행 후 허리·엉덩이 뻐근. 햄스트링 매우 짧음.",
    preferences: "짧고 강한 관리, 스트레칭 코칭 선호",
    privacyConsent: true,
    privacyConsentAt: "2026-10-12T16:00:00+09:00",
    assignedTherapistId: "therapist_1",
    createdAt: "2026-10-12T16:00:00+09:00",
  },
];

export const clientPackages: ClientPackage[] = [
  { id: "pkg_1", clientId: "client_1", packageName: "목·어깨 집중 케어 10회권", totalSessions: 10, usedSessions: 3, startDate: "2026-09-28", expiryDate: "2027-03-28", status: "active" },
  { id: "pkg_2", clientId: "client_2", packageName: "라운드숄더 교정 8회권", totalSessions: 8, usedSessions: 2, startDate: "2026-10-02", expiryDate: "2027-02-02", status: "active" },
  { id: "pkg_3", clientId: "client_3", packageName: "허리·골반 밸런스 10회권", totalSessions: 10, usedSessions: 1, startDate: "2026-10-05", expiryDate: "2027-04-05", status: "active" },
  { id: "pkg_4", clientId: "client_4", packageName: "하체 순환 & 유연성 5회권", totalSessions: 5, usedSessions: 0, startDate: "2026-10-12", expiryDate: "2027-01-12", status: "active" },
];

export const sessions: TreatmentSession[] = [
  {
    id: "sess_1", branchId: "main", clientId: "client_1", packageId: "pkg_1", therapistName: "한지민 관리사", sessionNumber: 1, sessionDate: "2026-09-28",
    checkedObservationIds: ["obs_neck_rot_pain", "obs_shoulder_elev"], selectedProgramIds: ["prog_upper_trap_release"],
    therapistPrivateNote: "우측 견갑거근 압통점 강함. 두통 호소 시 후두하근 위주 접근. 초회라 압 약하게.",
    clientPublicNote: "첫 관리로 어깨 위쪽 긴장을 풀었습니다. 업무 중 1시간마다 어깨를 아래로 툭 떨어뜨리는 습관을 만들어 보세요.",
    painLevelBefore: 7, painLevelAfter: 5,
  },
  {
    id: "sess_2", branchId: "main", clientId: "client_1", packageId: "pkg_1", therapistName: "한지민 관리사", sessionNumber: 2, sessionDate: "2026-10-05",
    checkedObservationIds: ["obs_neck_rot_pain", "obs_forward_head"], selectedProgramIds: ["prog_cervical_release"],
    therapistPrivateNote: "회전 가동범위 우측 60° → 70° 개선. 후두하근 압통 감소.",
    clientPublicNote: "고개 돌림이 지난주보다 부드러워졌어요. 턱 당기기 운동을 꾸준히 해주세요.",
    painLevelBefore: 6, painLevelAfter: 4,
  },
  {
    id: "sess_3", branchId: "main", clientId: "client_1", packageId: "pkg_1", therapistName: "한지민 관리사", sessionNumber: 3, sessionDate: "2026-10-19",
    checkedObservationIds: ["obs_neck_rot_pain", "obs_forward_head", "obs_round_shoulder"], selectedProgramIds: ["prog_cervical_release", "prog_chest_opening"],
    therapistPrivateNote: "2주 공백으로 일부 재발. 소흉근 단축 확인 → 가슴 열기 병행.",
    clientPublicNote: "목 관리와 함께 가슴 앞쪽을 열어주는 관리를 했습니다. 도어웨이 스트레칭을 추가로 드렸어요.",
    painLevelBefore: 6, painLevelAfter: 3,
  },
  {
    id: "sess_4", branchId: "main", clientId: "client_2", packageId: "pkg_2", therapistName: "한지민 관리사", sessionNumber: 1, sessionDate: "2026-10-02",
    checkedObservationIds: ["obs_round_shoulder", "obs_arm_raise_limit"], selectedProgramIds: ["prog_chest_opening"],
    therapistPrivateNote: "좌측 어깨 탈구 병력 → 외전·외회전 스트레칭 가동범위 제한하여 진행.",
    clientPublicNote: "말린 어깨를 펴주는 첫 관리를 받았습니다. 벽 슬라이드는 무리하지 않는 범위에서 해보세요.",
    painLevelBefore: 4, painLevelAfter: 2,
  },
  {
    id: "sess_5", branchId: "main", clientId: "client_2", packageId: "pkg_2", therapistName: "한지민 관리사", sessionNumber: 2, sessionDate: "2026-10-16",
    checkedObservationIds: ["obs_round_shoulder", "obs_winged_scapula", "obs_thoracic_stiff"], selectedProgramIds: ["prog_scapular_stabilization", "prog_thoracic_mobility"],
    therapistPrivateNote: "우측 전거근 약화 확인. 벤치프레스 시 어깨 보호 코칭.",
    clientPublicNote: "견갑골을 잡아주는 근육 운동과 등 관절 가동 관리를 진행했습니다.",
    painLevelBefore: 3, painLevelAfter: 1,
  },
  {
    id: "sess_6", branchId: "main", clientId: "client_3", packageId: "pkg_3", therapistName: "한지민 관리사", sessionNumber: 1, sessionDate: "2026-10-05",
    checkedObservationIds: ["obs_low_back_tight", "obs_pelvic_asym", "obs_calf_tight"], selectedProgramIds: ["prog_lumbar_decompress", "prog_pelvic_balance"],
    therapistPrivateNote: "좌측 요방형근 과긴장, 우측 골반 상승. 종아리는 하지정맥류 이력으로 오늘은 생략.",
    clientPublicNote: "허리와 골반 균형을 맞추는 관리를 했습니다. 종아리는 부담을 주지 않도록 이번에는 제외했어요.",
    painLevelBefore: 6, painLevelAfter: 4,
  },
];

export const assignedExercises: AssignedExercise[] = [
  { id: "ae_1", sessionId: "sess_3", clientId: "client_1", exerciseId: "ex_chin_tuck_wall", isActive: true, assignedAt: "2026-10-19T12:00:00+09:00" },
  { id: "ae_2", sessionId: "sess_3", clientId: "client_1", exerciseId: "ex_levator_stretch", isActive: true, assignedAt: "2026-10-19T12:00:00+09:00" },
  { id: "ae_3", sessionId: "sess_3", clientId: "client_1", exerciseId: "ex_doorway_chest", customPrescription: "30초 × 3회 / 하루 1세트 (처음이라 가볍게)", isActive: true, assignedAt: "2026-10-19T12:00:00+09:00" },
  { id: "ae_4", sessionId: "sess_5", clientId: "client_2", exerciseId: "ex_wall_slide", isActive: true, assignedAt: "2026-10-16T18:00:00+09:00" },
  { id: "ae_5", sessionId: "sess_5", clientId: "client_2", exerciseId: "ex_thoracic_rotation", isActive: true, assignedAt: "2026-10-16T18:00:00+09:00" },
  { id: "ae_6", sessionId: "sess_6", clientId: "client_3", exerciseId: "ex_hip_bridge_clam", isActive: true, assignedAt: "2026-10-05T13:00:00+09:00" },
];

export const exerciseCheckLogs: ExerciseCheckLog[] = [
  { id: "log_1", assignedExerciseId: "ae_1", clientId: "client_1", checkedDate: "2026-10-20", completed: true, clientFeedback: "편안함" },
  { id: "log_2", assignedExerciseId: "ae_2", clientId: "client_1", checkedDate: "2026-10-20", completed: true },
  { id: "log_3", assignedExerciseId: "ae_1", clientId: "client_1", checkedDate: "2026-10-22", completed: true },
  { id: "log_4", assignedExerciseId: "ae_4", clientId: "client_2", checkedDate: "2026-10-18", completed: true, clientFeedback: "약간 당김" },
  { id: "log_5", assignedExerciseId: "ae_5", clientId: "client_2", checkedDate: "2026-10-18", completed: true },
];

/** 데모 모드 기본 관리사 정보 */
export const demoTherapist = { id: "therapist_1", name: "한지민 관리사" };
