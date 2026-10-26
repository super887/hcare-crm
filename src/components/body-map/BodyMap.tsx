"use client";

import React, { useState, useMemo } from "react";

export interface BodyMapProps {
  /** 하이라이트할 근육 이름 목록 (예: ["상부승모근", "견갑거근", "소흉근", "다열근", "사각근", "내전근", "대퇴근막장근"]) */
  activeMuscles?: string[];
  /** 크기 모드: sm(모바일 카드용), md(기본), lg(관리사 분석용 대형) */
  size?: "sm" | "md" | "lg";
  /** 초기 뷰: front(앞면) 또는 back(뒷면) */
  initialView?: "front" | "back";
  /** 컨트롤 버튼 표시 여부 */
  showControls?: boolean;
  /** 클릭 시 콜백 */
  onMuscleClick?: (muscleName: string) => void;
  /** 추가 클래스 */
  className?: string;
}

// 근육 부위와 한국어 명칭 매핑 키 정의
interface MuscleZone {
  id: string;
  name: string;
  aliases?: string[]; // 부분 매칭용 별칭
  latinName?: string;
  category: "neck" | "shoulder" | "chest" | "back" | "core" | "pelvis" | "leg";
  view: "front" | "back" | "both";
  svgPaths: string[]; // path d attributes
}

/**
 * 14년 경력 물리치료사 임상 기준 정밀 해부학적 벡터 구획 (전면 / 후면)
 * viewBox: 0 0 200 380
 */
const MUSCLE_ZONES: MuscleZone[] = [
  // =========================================================================
  // ===================== FRONT (전면 해부학 구획) =========================
  // =========================================================================
  {
    id: "scm",
    name: "흉쇄유돌근",
    latinName: "Sternocleidomastoid (SCM)",
    category: "neck",
    view: "front",
    svgPaths: [
      "M 93 42 Q 91 55 86 64 L 89 65 Q 95 56 97 43 Z", // 좌
      "M 107 42 Q 109 55 114 64 L 111 65 Q 105 56 103 43 Z", // 우
    ],
  },
  {
    id: "scalene",
    name: "사각근",
    aliases: ["전사각근", "중사각근"],
    latinName: "Scalene Muscles",
    category: "neck",
    view: "front",
    svgPaths: [
      "M 88 47 L 84 62 L 87 63 L 91 49 Z", // 목 옆 사각근 좌
      "M 112 47 L 116 62 L 113 63 L 109 49 Z", // 목 옆 사각근 우
    ],
  },
  {
    id: "front_upper_trap",
    name: "상부승모근",
    latinName: "Upper Trapezius (Ant.)",
    category: "neck",
    view: "front",
    svgPaths: [
      "M 84 57 Q 75 62 68 70 L 71 73 Q 80 64 87 62 Z", // 전면 어깨선 승모근 좌
      "M 116 57 Q 125 62 132 70 L 129 73 Q 120 64 113 62 Z", // 우
    ],
  },
  {
    id: "deltoid_front",
    name: "삼각근",
    latinName: "Deltoid (Anterior)",
    category: "shoulder",
    view: "front",
    svgPaths: [
      "M 68 68 Q 59 76 57 93 Q 66 89 71 78 Z",
      "M 132 68 Q 141 76 143 93 Q 134 89 129 78 Z",
    ],
  },
  {
    id: "pectoralis_major",
    name: "대흉근",
    latinName: "Pectoralis Major",
    category: "chest",
    view: "front",
    svgPaths: [
      "M 74 72 Q 90 70 98 75 L 97 96 Q 76 98 70 82 Z",
      "M 126 72 Q 110 70 102 75 L 103 96 Q 124 98 130 82 Z",
    ],
  },
  {
    id: "pectoralis_minor",
    name: "소흉근",
    latinName: "Pectoralis Minor",
    category: "chest",
    view: "front",
    svgPaths: [
      "M 73 76 L 82 86 L 77 89 Z",
      "M 127 76 L 118 86 L 123 89 Z",
    ],
  },
  {
    id: "serratus_anterior",
    name: "전거근",
    latinName: "Serratus Anterior",
    category: "chest",
    view: "front",
    svgPaths: [
      "M 71 98 L 76 96 L 75 113 L 70 111 Z",
      "M 129 98 L 124 96 L 125 113 L 130 111 Z",
    ],
  },
  {
    id: "rectus_abdominis",
    name: "복직근",
    aliases: ["복근", "코어"],
    latinName: "Rectus Abdominis",
    category: "core",
    view: "front",
    svgPaths: [
      // 정중앙 복직근 (식스팩 구획)
      "M 92 100 Q 100 99 108 100 L 107 142 Q 100 144 93 142 Z",
    ],
  },
  {
    id: "transversus_abdominis",
    name: "복횡근",
    aliases: ["복횡근", "코어호흡근", "복부코어"],
    latinName: "Transverse Abdominis (Core)",
    category: "core",
    view: "front",
    svgPaths: [
      // 양 옆구리를 감싸는 복횡근/내외복사근 부위
      "M 73 114 Q 85 116 89 122 L 88 140 Q 77 138 72 130 Z", // 좌측 외측 복벽
      "M 127 114 Q 115 116 111 122 L 112 140 Q 123 138 128 130 Z", // 우측 외측 복벽
    ],
  },
  {
    id: "iliopsoas",
    name: "장요근",
    latinName: "Iliopsoas (Deep Hip Flexor)",
    category: "pelvis",
    view: "front",
    svgPaths: [
      // 서혜부 안쪽 깊은 고관절 굴곡근
      "M 88 142 Q 95 145 97 161 L 92 163 Q 86 151 83 144 Z",
      "M 112 142 Q 105 145 103 161 L 108 163 Q 114 151 117 144 Z",
    ],
  },
  {
    id: "tensor_fasciae_latae",
    name: "대퇴근막장근",
    aliases: ["TFL", "대퇴근막장근"],
    latinName: "Tensor Fasciae Latae (TFL)",
    category: "pelvis",
    view: "front",
    svgPaths: [
      // 골반 ASIS 외측 허벅지 바깥 시작부
      "M 70 148 Q 74 150 75 166 L 69 170 Q 67 156 70 148 Z",
      "M 130 148 Q 126 150 125 166 L 131 170 Q 133 156 130 148 Z",
    ],
  },
  {
    id: "adductors",
    name: "내전근",
    aliases: ["장내전근", "대내전근", "치골근"],
    latinName: "Adductor Group",
    category: "leg",
    view: "front",
    svgPaths: [
      // 허벅지 안쪽 사타구니 내전근 그룹
      "M 93 166 Q 94 185 91 210 L 87 208 Q 89 180 88 166 Z",
      "M 107 166 Q 106 185 109 210 L 113 208 Q 111 180 112 166 Z",
    ],
  },
  {
    id: "quadriceps_vmo",
    name: "내측광근",
    aliases: ["대퇴사두근", "내측광근"],
    latinName: "Vastus Medialis Oblique (VMO)",
    category: "leg",
    view: "front",
    svgPaths: [
      // 무릎 안쪽 상단 내측광근
      "M 84 210 Q 88 215 89 235 L 82 237 Q 80 220 84 210 Z",
      "M 116 210 Q 112 215 111 235 L 118 237 Q 120 220 116 210 Z",
    ],
  },
  {
    id: "tibialis_anterior",
    name: "전경골근",
    aliases: ["전경골근", "정강이앞근육"],
    latinName: "Tibialis Anterior",
    category: "leg",
    view: "front",
    svgPaths: [
      // 무릎 아래 정강이 외측 전면
      "M 77 256 Q 74 290 76 335 L 83 334 Q 85 290 83 256 Z",
      "M 123 256 Q 126 290 124 335 L 117 334 Q 115 290 117 256 Z",
    ],
  },

  // =========================================================================
  // ===================== BACK (후면 해부학 구획) ==========================
  // =========================================================================
  {
    id: "splenius_capitis",
    name: "두판상근",
    latinName: "Splenius Capitis",
    category: "neck",
    view: "back",
    svgPaths: [
      "M 93 42 Q 97 39 100 39 Q 103 39 107 42 L 105 54 Q 100 53 95 54 Z",
    ],
  },
  {
    id: "upper_trapezius",
    name: "상부승모근",
    latinName: "Upper Trapezius",
    category: "neck",
    view: "back",
    svgPaths: [
      "M 95 49 Q 82 55 68 68 L 73 73 Q 86 64 97 60 Z",
      "M 105 49 Q 118 55 132 68 L 127 73 Q 114 64 103 60 Z",
    ],
  },
  {
    id: "levator_scapulae",
    name: "견갑거근",
    latinName: "Levator Scapulae",
    category: "neck",
    view: "back",
    svgPaths: [
      "M 92 48 L 84 66 L 80 64 L 90 47 Z",
      "M 108 48 L 116 66 L 120 64 L 110 47 Z",
    ],
  },
  {
    id: "rhomboids",
    name: "능형근",
    latinName: "Rhomboids",
    category: "back",
    view: "back",
    svgPaths: [
      "M 96 74 L 84 84 L 87 96 L 97 86 Z",
      "M 104 74 L 116 84 L 113 96 L 103 86 Z",
    ],
  },
  {
    id: "mid_trapezius",
    name: "중부승모근",
    latinName: "Middle Trapezius",
    category: "back",
    view: "back",
    svgPaths: [
      "M 97 63 L 103 63 L 102 78 L 98 78 Z",
      "M 88 73 L 97 73 L 97 79 L 88 76 Z",
      "M 112 73 L 103 73 L 103 79 L 112 76 Z",
    ],
  },
  {
    id: "lower_trapezius",
    name: "하부승모근",
    latinName: "Lower Trapezius",
    category: "back",
    view: "back",
    svgPaths: [
      "M 98 83 L 102 83 L 100 114 Z",
    ],
  },
  {
    id: "infraspinatus",
    name: "극하근",
    latinName: "Infraspinatus (Rotator Cuff)",
    category: "shoulder",
    view: "back",
    svgPaths: [
      "M 74 76 Q 81 78 81 88 L 72 86 Z",
      "M 126 76 Q 119 78 119 88 L 128 86 Z",
    ],
  },
  {
    id: "erector_spinae_thoracic",
    name: "척추기립근(흉추부)",
    aliases: ["척추기립근", "흉추기립근"],
    latinName: "Erector Spinae (Thoracic)",
    category: "back",
    view: "back",
    svgPaths: [
      "M 94 90 L 98 90 L 97 125 L 94 125 Z",
      "M 102 90 L 106 90 L 106 125 L 102 125 Z",
    ],
  },
  {
    id: "multifidus",
    name: "다열근",
    aliases: ["다열근", "심부척추근"],
    latinName: "Multifidus (Deep Spine)",
    category: "back",
    view: "back",
    svgPaths: [
      // 척추 돌기 바로 옆 가장 깊은 심부 분절 안정화 근육
      "M 98 94 L 100 94 L 99 135 L 98 135 Z",
      "M 100 94 L 102 94 L 102 135 L 101 135 Z",
    ],
  },
  {
    id: "latissimus_dorsi",
    name: "광배근",
    latinName: "Latissimus Dorsi",
    category: "back",
    view: "back",
    svgPaths: [
      "M 73 94 Q 85 96 93 118 L 88 135 Q 73 118 71 100 Z",
      "M 127 94 Q 115 96 107 118 L 112 135 Q 127 118 129 100 Z",
    ],
  },
  {
    id: "quadratus_lumborum",
    name: "요방형근",
    aliases: ["QL", "요방형근"],
    latinName: "Quadratus Lumborum (QL)",
    category: "back",
    view: "back",
    svgPaths: [
      "M 87 126 L 93 126 L 92 144 L 85 142 Z",
      "M 113 126 L 107 126 L 108 144 L 115 142 Z",
    ],
  },
  {
    id: "erector_spinae_lumbar",
    name: "요추기립근",
    aliases: ["허리기립근"],
    latinName: "Erector Spinae (Lumbar)",
    category: "back",
    view: "back",
    svgPaths: [
      "M 95 125 L 98 125 L 97 148 L 95 148 Z",
      "M 102 125 L 105 125 L 105 148 L 103 148 Z",
    ],
  },
  {
    id: "gluteus_maximus",
    name: "대둔근",
    latinName: "Gluteus Maximus",
    category: "pelvis",
    view: "back",
    svgPaths: [
      "M 74 150 Q 88 147 98 152 Q 97 186 78 186 Q 72 170 74 150 Z",
      "M 126 150 Q 112 147 102 152 Q 103 186 122 186 Q 128 170 126 150 Z",
    ],
  },
  {
    id: "gluteus_medius",
    name: "중둔근",
    latinName: "Gluteus Medius",
    category: "pelvis",
    view: "back",
    svgPaths: [
      "M 71 144 Q 82 142 88 148 L 73 158 Z",
      "M 129 144 Q 118 142 112 148 L 127 158 Z",
    ],
  },
  {
    id: "piriformis",
    name: "이상근",
    latinName: "Piriformis (Deep Hip Rotator)",
    category: "pelvis",
    view: "back",
    svgPaths: [
      "M 80 158 L 95 162 L 94 167 L 79 162 Z",
      "M 120 158 L 105 162 L 106 167 L 121 162 Z",
    ],
  },
  {
    id: "hamstrings",
    name: "햄스트링",
    aliases: ["대퇴이두근", "반건양근", "반막양근"],
    latinName: "Hamstrings",
    category: "leg",
    view: "back",
    svgPaths: [
      "M 76 190 Q 72 215 78 242 L 92 240 Q 95 210 94 190 Z",
      "M 124 190 Q 128 215 122 242 L 108 240 Q 105 210 106 190 Z",
    ],
  },
  {
    id: "gastrocnemius",
    name: "비복근",
    latinName: "Gastrocnemius",
    category: "leg",
    view: "back",
    svgPaths: [
      "M 76 256 Q 70 282 77 315 L 86 313 Q 89 280 86 256 Z",
      "M 124 256 Q 130 282 123 315 L 114 313 Q 111 280 114 256 Z",
    ],
  },
  {
    id: "soleus",
    name: "가자미근",
    latinName: "Soleus",
    category: "leg",
    view: "back",
    svgPaths: [
      "M 77 314 L 86 312 L 85 338 L 79 338 Z",
      "M 123 314 L 114 312 L 115 338 L 121 338 Z",
    ],
  },
  {
    id: "tibialis_posterior",
    name: "후경골근",
    aliases: ["후경골근", "발목안쪽심부근육"],
    latinName: "Tibialis Posterior (Deep Calf/Ankle)",
    category: "leg",
    view: "back",
    svgPaths: [
      // 비복근/가자미근 안쪽 심부, 안쪽 복사뼈 쪽 주행
      "M 86 280 L 89 280 L 88 335 L 85 335 Z",
      "M 114 280 L 111 280 L 112 335 L 115 335 Z",
    ],
  },
];

export function BodyMap({
  activeMuscles = [],
  size = "md",
  initialView = "back",
  showControls = true,
  onMuscleClick,
  className = "",
}: BodyMapProps) {
  const [view, setView] = useState<"front" | "back">(initialView);
  const [hoveredMuscle, setHoveredMuscle] = useState<MuscleZone | null>(null);

  // 크기 설정
  const dimensions = {
    sm: { width: 140, height: 260 },
    md: { width: 200, height: 370 },
    lg: { width: 260, height: 480 },
  }[size];

  // 활성화된 근육 목록 정규화
  const activeNormalized = useMemo(() => {
    return activeMuscles.map((m) => m.trim().toLowerCase());
  }, [activeMuscles]);

  const isMuscleActive = (zone: MuscleZone) => {
    const zoneName = zone.name.toLowerCase();
    for (const active of activeNormalized) {
      if (zoneName.includes(active) || active.includes(zoneName)) return true;
      if (zone.aliases) {
        for (const alias of zone.aliases) {
          if (alias.toLowerCase().includes(active) || active.includes(alias.toLowerCase())) {
            return true;
          }
        }
      }
    }
    return false;
  };

  // 현재 뷰에 표시할 근육 영역들
  const visibleZones = useMemo(() => {
    return MUSCLE_ZONES.filter((z) => z.view === view || z.view === "both");
  }, [view]);

  // 활성화된 근육 수
  const activeCountInCurrentView = visibleZones.filter(isMuscleActive).length;

  return (
    <div
      className={`relative flex flex-col items-center bg-slate-900/90 text-white rounded-2xl p-4 border border-slate-800 shadow-xl backdrop-blur select-none ${className}`}
    >
      {/* 상단 컨트롤러 (앞면 / 뒷면 전환) */}
      {showControls && (
        <div className="w-full flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
            <span>신체 바디 맵</span>
            {activeMuscles.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                {activeMuscles.length}개 타겟
              </span>
            )}
          </div>

          {/* 앞면/뒷면 토글 탭 */}
          <div className="inline-flex rounded-lg bg-slate-800 p-0.5 border border-slate-700 text-xs">
            <button
              type="button"
              onClick={() => setView("front")}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                view === "front"
                  ? "bg-rose-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              전면 (Front)
            </button>
            <button
              type="button"
              onClick={() => setView("back")}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                view === "back"
                  ? "bg-rose-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              후면 (Back)
            </button>
          </div>
        </div>
      )}

      {/* 바디 맵 SVG 그래픽 영역 */}
      <div className="relative flex items-center justify-center my-1">
        <svg
          viewBox="0 0 200 380"
          width={dimensions.width}
          height={dimensions.height}
          className="transition-transform duration-300 filter drop-shadow-md"
        >
          <defs>
            {/* 활성 근육용 네온 코랄 그라디언트 */}
            <linearGradient id="neonGlowRed" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#e11d48" stopOpacity="0.9" />
            </linearGradient>

            {/* 기본 비활성 근육 그라디언트 */}
            <linearGradient id="neutralBody" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#334155" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#1e293b" stopOpacity="0.9" />
            </linearGradient>

            {/* 은은한 펄스 필터 */}
            <filter id="pulseGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#f43f5e" floodOpacity="0.8" />
            </filter>
          </defs>

          {/* 1. 배경 인체 기본 실루엣 가이드 (머리, 목, 어깨, 팔, 몸통, 다리) */}
          <g className="fill-slate-800/60 stroke-slate-700/60 stroke-[1]">
            {/* 머리 */}
            <ellipse cx="100" cy="22" rx="14" ry="17" />
            {/* 목 */}
            <path d="M 94 36 L 94 48 L 106 48 L 106 36 Z" />
            {/* 전면/후면 베이스 실루엣 외곽선 */}
            {view === "front" ? (
              <path
                d="M 68 68 Q 60 76 56 100 L 52 145 Q 50 152 46 160 L 52 162 L 58 135 L 62 105 L 70 78 Q 85 70 100 70 Q 115 70 130 78 L 138 105 L 142 135 L 148 162 L 154 160 Q 150 152 148 145 L 144 100 Q 140 76 132 68 Q 118 60 100 60 Q 82 60 68 68 Z"
                fill="none"
                stroke="#475569"
                strokeWidth="1.2"
              />
            ) : (
              <path
                d="M 68 68 Q 60 76 56 100 L 52 145 Q 50 152 46 160 L 52 162 L 58 135 L 62 105 L 70 78 Q 85 64 100 64 Q 115 64 130 78 L 138 105 L 142 135 L 148 162 L 154 160 Q 150 152 148 145 L 144 100 Q 140 76 132 68 Q 118 56 100 56 Q 82 56 68 68 Z"
                fill="none"
                stroke="#475569"
                strokeWidth="1.2"
              />
            )}
          </g>

          {/* 2. 각 근육 구획 렌더링 */}
          {visibleZones.map((zone) => {
            const active = isMuscleActive(zone);
            const hovered = hoveredMuscle?.id === zone.id;

            return (
              <g
                key={zone.id}
                className="cursor-pointer transition-all duration-200"
                onMouseEnter={() => setHoveredMuscle(zone)}
                onMouseLeave={() => setHoveredMuscle(null)}
                onClick={() => onMuscleClick && onMuscleClick(zone.name)}
              >
                {zone.svgPaths.map((d, i) => (
                  <path
                    key={i}
                    d={d}
                    fill={active ? "url(#neonGlowRed)" : hovered ? "#475569" : "url(#neutralBody)"}
                    stroke={active ? "#fda4af" : hovered ? "#94a3b8" : "#334155"}
                    strokeWidth={active ? 1.5 : 0.8}
                    filter={active ? "url(#pulseGlow)" : undefined}
                    className={`transition-colors duration-200 ${
                      active ? "animate-pulse" : ""
                    }`}
                  />
                ))}
              </g>
            );
          })}

          {/* 인체 중심 기준선 (해부학 가이드) */}
          <line
            x1="100"
            y1="40"
            x2="100"
            y2="150"
            stroke="#334155"
            strokeWidth="0.8"
            strokeDasharray="2,2"
          />
        </svg>

        {/* 호버 시 플로팅 툴팁 */}
        {hoveredMuscle && (
          <div className="absolute -bottom-2 bg-slate-950/95 text-white border border-rose-500/50 rounded-lg px-2.5 py-1 text-[11px] shadow-lg pointer-events-none transform translate-y-full whitespace-nowrap z-20">
            <span className="font-semibold text-rose-300">{hoveredMuscle.name}</span>
            {hoveredMuscle.latinName && (
              <span className="text-[9px] text-slate-400 ml-1.5 font-mono">
                ({hoveredMuscle.latinName})
              </span>
            )}
            {isMuscleActive(hoveredMuscle) && (
              <span className="ml-1.5 px-1 py-0.2 rounded bg-rose-500 text-[9px] font-bold">
                케어 타겟
              </span>
            )}
          </div>
        )}
      </div>

      {/* 하단 범례 (Legend) */}
      <div className="w-full mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.7)]" />
          <span className="font-medium text-slate-300">
            {activeCountInCurrentView > 0
              ? `${activeCountInCurrentView}개 부위 집중 이완`
              : "선택된 타겟 부위"}
          </span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-slate-500">
          <span>💡 클릭·호버하여 근육명 확인</span>
        </div>
      </div>
    </div>
  );
}

export default BodyMap;
