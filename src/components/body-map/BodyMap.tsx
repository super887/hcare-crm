"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Maximize2, Play, Pause, RotateCcw, ZoomIn, ZoomOut, Box, Layers } from "lucide-react";

export interface BodyMapProps {
  /** 하이라이트할 근육 이름 목록 (예: ["상부승모근", "견갑거근", "소흉근", "다열근", "사각근", "내전근", "대퇴근막장근"]) */
  activeMuscles?: string[];
  /** 크기 모드: sm(모바일 카드용), md(기본), lg(관리사/고객 PC 대형) */
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

interface Vec3 {
  x: number;
  y: number;
  z: number;
}

interface Muscle3DPart {
  /** 중심 좌표 (단위: 인체 로컬 좌표계, y: -1.75 발끝 ~ +1.70 정수리, x: 좌우, z: +앞 / -뒤) */
  center: Vec3;
  /** 3축 반지름 (근육 방추형 볼륨) */
  radii: Vec3;
  /** 오일러 회전 (라디안) */
  rot?: Vec3;
}

interface MuscleZone {
  id: string;
  name: string;
  aliases?: string[];
  latinName?: string;
  category: "neck" | "shoulder" | "chest" | "back" | "core" | "pelvis" | "leg";
  view: "front" | "back" | "both";
  svgPaths: string[];
  /** 3D 입체 근육 볼륨 정의 (좌·우 대칭 또는 중앙 근육) */
  parts3D: Muscle3DPart[];
}

/** 좌우 대칭 근육 생성 헬퍼 */
function bilateral(
  x: number,
  y: number,
  z: number,
  rx: number,
  ry: number,
  rz: number,
  rotX = 0,
  rotY = 0,
  rotZ = 0,
): Muscle3DPart[] {
  return [
    { center: { x: -x, y, z }, radii: { x: rx, y: ry, z: rz }, rot: { x: rotX, y: -rotY, z: -rotZ } },
    { center: { x: x, y, z }, radii: { x: rx, y: ry, z: rz }, rot: { x: rotX, y: rotY, z: rotZ } },
  ];
}

/**
 * 14년 경력 물리치료사 임상 기준 정밀 해부학 데이터 (3D 입체 볼륨 + 2D 벡터 통합)
 */
const MUSCLE_ZONES: MuscleZone[] = [
  // ===================== FRONT (전면/측면 해부학 구획) =====================
  {
    id: "scm",
    name: "흉쇄유돌근",
    latinName: "Sternocleidomastoid (SCM)",
    category: "neck",
    view: "front",
    svgPaths: [
      "M 93 42 Q 91 55 86 64 L 89 65 Q 95 56 97 43 Z",
      "M 107 42 Q 109 55 114 64 L 111 65 Q 105 56 103 43 Z",
    ],
    parts3D: bilateral(0.085, 1.18, 0.085, 0.032, 0.13, 0.032, 0.15, 0, -0.22),
  },
  {
    id: "scalene",
    name: "사각근",
    aliases: ["전사각근", "중사각근"],
    latinName: "Scalene Muscles",
    category: "neck",
    view: "front",
    svgPaths: [
      "M 88 47 L 84 62 L 87 63 L 91 49 Z",
      "M 112 47 L 116 62 L 113 63 L 109 49 Z",
    ],
    parts3D: bilateral(0.115, 1.16, 0.03, 0.03, 0.11, 0.035, 0, 0, -0.28),
  },
  {
    id: "deltoid_front",
    name: "삼각근",
    latinName: "Deltoid",
    category: "shoulder",
    view: "front",
    svgPaths: [
      "M 68 68 Q 59 76 57 93 Q 66 89 71 78 Z",
      "M 132 68 Q 141 76 143 93 Q 134 89 129 78 Z",
    ],
    parts3D: bilateral(0.42, 0.91, 0.02, 0.105, 0.15, 0.105, 0, 0, 0.2),
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
    parts3D: bilateral(0.17, 0.84, 0.185, 0.16, 0.135, 0.065, -0.1, 0.18, 0.08),
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
    parts3D: bilateral(0.24, 0.88, 0.175, 0.085, 0.11, 0.055, -0.1, 0.25, 0.35),
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
    parts3D: bilateral(0.295, 0.64, 0.09, 0.055, 0.14, 0.1, 0, 0.4, 0),
  },
  {
    id: "rectus_abdominis",
    name: "복직근",
    aliases: ["복근", "코어"],
    latinName: "Rectus Abdominis",
    category: "core",
    view: "front",
    svgPaths: ["M 92 100 Q 100 99 108 100 L 107 142 Q 100 144 93 142 Z"],
    parts3D: bilateral(0.075, 0.45, 0.175, 0.07, 0.24, 0.05, 0.05, 0, 0),
  },
  {
    id: "transversus_abdominis",
    name: "복횡근",
    aliases: ["복횡근", "코어호흡근", "복부코어"],
    latinName: "Transverse Abdominis (Core)",
    category: "core",
    view: "front",
    svgPaths: [
      "M 73 114 Q 85 116 89 122 L 88 140 Q 77 138 72 130 Z",
      "M 127 114 Q 115 116 111 122 L 112 140 Q 123 138 128 130 Z",
    ],
    parts3D: bilateral(0.22, 0.38, 0.11, 0.075, 0.17, 0.11, 0, 0.4, 0),
  },
  {
    id: "iliopsoas",
    name: "장요근",
    latinName: "Iliopsoas (Deep Hip Flexor)",
    category: "pelvis",
    view: "front",
    svgPaths: [
      "M 88 142 Q 95 145 97 161 L 92 163 Q 86 151 83 144 Z",
      "M 112 142 Q 105 145 103 161 L 108 163 Q 114 151 117 144 Z",
    ],
    parts3D: bilateral(0.115, 0.12, 0.135, 0.06, 0.18, 0.06, 0.15, 0, -0.18),
  },
  {
    id: "tensor_fasciae_latae",
    name: "대퇴근막장근",
    aliases: ["TFL", "대퇴근막장근"],
    latinName: "Tensor Fasciae Latae (TFL)",
    category: "pelvis",
    view: "front",
    svgPaths: [
      "M 70 148 Q 74 150 75 166 L 69 170 Q 67 156 70 148 Z",
      "M 130 148 Q 126 150 125 166 L 131 170 Q 133 156 130 148 Z",
    ],
    parts3D: bilateral(0.275, 0.02, 0.08, 0.055, 0.16, 0.075, 0.1, 0.25, 0),
  },
  {
    id: "adductors",
    name: "내전근",
    aliases: ["장내전근", "대내전근", "치골근"],
    latinName: "Adductor Group",
    category: "leg",
    view: "front",
    svgPaths: [
      "M 93 166 Q 94 185 91 210 L 87 208 Q 89 180 88 166 Z",
      "M 107 166 Q 106 185 109 210 L 113 208 Q 111 180 112 166 Z",
    ],
    parts3D: bilateral(0.115, -0.32, 0.085, 0.065, 0.23, 0.075, 0, 0, 0.08),
  },
  {
    id: "quadriceps_vmo",
    name: "내측광근",
    aliases: ["대퇴사두근", "내측광근"],
    latinName: "Vastus Medialis Oblique (VMO)",
    category: "leg",
    view: "front",
    svgPaths: [
      "M 84 210 Q 88 215 89 235 L 82 237 Q 80 220 84 210 Z",
      "M 116 210 Q 112 215 111 235 L 118 237 Q 120 220 116 210 Z",
    ],
    parts3D: bilateral(0.155, -0.52, 0.13, 0.075, 0.18, 0.075, 0.05, -0.15, 0),
  },
  {
    id: "tibialis_anterior",
    name: "전경골근",
    aliases: ["전경골근", "정강이앞근육"],
    latinName: "Tibialis Anterior",
    category: "leg",
    view: "front",
    svgPaths: [
      "M 77 256 Q 74 290 76 335 L 83 334 Q 85 290 83 256 Z",
      "M 123 256 Q 126 290 124 335 L 117 334 Q 115 290 117 256 Z",
    ],
    parts3D: bilateral(0.20, -1.12, 0.095, 0.05, 0.28, 0.055, 0.04, 0.1, 0),
  },

  // ===================== BACK (후면 해부학 구획) =====================
  {
    id: "splenius_capitis",
    name: "두판상근",
    aliases: ["후두하근", "두판상근"],
    latinName: "Splenius Capitis / Suboccipital",
    category: "neck",
    view: "back",
    svgPaths: ["M 93 42 Q 97 39 100 39 Q 103 39 107 42 L 105 54 Q 100 53 95 54 Z"],
    parts3D: bilateral(0.055, 1.24, -0.095, 0.048, 0.11, 0.042, -0.15, 0, 0.1),
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
    parts3D: bilateral(0.21, 1.07, -0.06, 0.16, 0.075, 0.075, 0, 0, -0.42),
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
    parts3D: bilateral(0.14, 1.11, -0.085, 0.042, 0.14, 0.045, 0, 0, -0.32),
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
    parts3D: bilateral(0.135, 0.87, -0.165, 0.095, 0.11, 0.045, 0, -0.15, -0.35),
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
    parts3D: bilateral(0.13, 0.94, -0.17, 0.12, 0.065, 0.042, 0, -0.1, 0),
  },
  {
    id: "lower_trapezius",
    name: "하부승모근",
    latinName: "Lower Trapezius",
    category: "back",
    view: "back",
    svgPaths: ["M 98 83 L 102 83 L 100 114 Z"],
    parts3D: bilateral(0.075, 0.72, -0.175, 0.075, 0.15, 0.04, 0.08, 0, 0.25),
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
    parts3D: bilateral(0.26, 0.86, -0.155, 0.09, 0.08, 0.05, 0, -0.3, -0.2),
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
    parts3D: bilateral(0.068, 0.62, -0.165, 0.045, 0.24, 0.048, 0, 0, 0),
  },
  {
    id: "multifidus",
    name: "다열근",
    aliases: ["다열근", "심부척추근"],
    latinName: "Multifidus (Deep Spine)",
    category: "back",
    view: "back",
    svgPaths: [
      "M 98 94 L 100 94 L 99 135 L 98 135 Z",
      "M 100 94 L 102 94 L 102 135 L 101 135 Z",
    ],
    parts3D: bilateral(0.032, 0.42, -0.17, 0.03, 0.26, 0.045, 0, 0, 0),
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
    parts3D: bilateral(0.22, 0.56, -0.125, 0.11, 0.22, 0.08, 0, -0.35, 0.22),
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
    parts3D: bilateral(0.145, 0.30, -0.135, 0.065, 0.13, 0.05, 0, -0.2, 0.1),
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
    parts3D: bilateral(0.065, 0.28, -0.155, 0.048, 0.16, 0.052, 0, 0, 0),
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
    parts3D: bilateral(0.15, -0.04, -0.155, 0.135, 0.155, 0.105, 0.1, -0.15, 0),
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
    parts3D: bilateral(0.245, 0.09, -0.07, 0.075, 0.11, 0.095, 0, -0.45, -0.2),
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
    parts3D: bilateral(0.155, -0.03, -0.175, 0.095, 0.045, 0.055, 0, -0.2, -0.25),
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
    parts3D: bilateral(0.185, -0.45, -0.095, 0.088, 0.28, 0.082, 0, 0, 0),
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
    parts3D: bilateral(0.19, -1.02, -0.095, 0.075, 0.20, 0.075, -0.05, 0, 0),
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
    parts3D: bilateral(0.19, -1.28, -0.075, 0.058, 0.16, 0.062, 0, 0, 0),
  },
  {
    id: "tibialis_posterior",
    name: "후경골근",
    aliases: ["후경골근", "발목안쪽심부근육"],
    latinName: "Tibialis Posterior (Deep Calf/Ankle)",
    category: "leg",
    view: "back",
    svgPaths: [
      "M 86 280 L 89 280 L 88 335 L 85 335 Z",
      "M 114 280 L 111 280 L 112 335 L 115 335 Z",
    ],
    parts3D: bilateral(0.145, -1.18, -0.065, 0.042, 0.24, 0.048, 0, 0, 0),
  },
];

// ============================================================================
// 3D 인체 마네킹 기본 골격/체형 파트 (비활성 반투명 메디컬 홀로그램 메쉬)
// ============================================================================
interface BaseMannequinPart {
  center: Vec3;
  radii: Vec3;
  rot?: Vec3;
}

const BASE_MANNEQUIN_PARTS: BaseMannequinPart[] = [
  // 머리 & 얼굴 & 목
  { center: { x: 0, y: 1.47, z: 0.01 }, radii: { x: 0.155, y: 0.21, z: 0.175 } },
  { center: { x: 0, y: 1.18, z: -0.01 }, radii: { x: 0.095, y: 0.13, z: 0.095 } },
  // 상부 흉곽 (가슴/등)
  { center: { x: 0, y: 0.82, z: 0 }, radii: { x: 0.31, y: 0.26, z: 0.165 } },
  // 복부 / 허리
  { center: { x: 0, y: 0.42, z: 0.01 }, radii: { x: 0.245, y: 0.24, z: 0.145 } },
  // 골반
  { center: { x: 0, y: 0.03, z: -0.01 }, radii: { x: 0.285, y: 0.18, z: 0.155 } },
  // 척추 기둥 라인 (경추~요추)
  { center: { x: 0, y: 0.65, z: -0.14 }, radii: { x: 0.035, y: 0.56, z: 0.035 } },
  // 좌·우 상완 (위팔)
  ...bilateral(0.45, 0.66, -0.01, 0.082, 0.25, 0.082, 0, 0, 0.08),
  // 좌·우 전완 (아래팔)
  ...bilateral(0.51, 0.23, 0.03, 0.066, 0.23, 0.066, 0.1, 0, 0.06),
  // 좌·우 손
  ...bilateral(0.54, -0.05, 0.06, 0.048, 0.09, 0.03, 0, 0, 0.05),
  // 좌·우 허벅지 (대퇴)
  ...bilateral(0.185, -0.42, 0, 0.13, 0.34, 0.13, 0, 0, -0.03),
  // 좌·우 무릎 관절
  ...bilateral(0.185, -0.78, 0.01, 0.092, 0.08, 0.092),
  // 좌·우 종아리/정강이 (하퇴)
  ...bilateral(0.185, -1.16, -0.01, 0.088, 0.33, 0.088),
  // 좌·우 발
  ...bilateral(0.185, -1.54, 0.07, 0.075, 0.065, 0.14),
];

// ============================================================================
// 3D 수학 및 삼각형 메쉬 생성 유틸리티
// ============================================================================
interface Tri3D {
  v0: Vec3;
  v1: Vec3;
  v2: Vec3;
  normal: Vec3;
  center: Vec3;
  muscleZone?: MuscleZone;
}

function rotatePoint(p: Vec3, rx: number, ry: number, rz: number): Vec3 {
  let { x, y, z } = p;
  if (rz !== 0) {
    const c = Math.cos(rz), s = Math.sin(rz);
    const nx = x * c - y * s;
    const ny = x * s + y * c;
    x = nx; y = ny;
  }
  if (rx !== 0) {
    const c = Math.cos(rx), s = Math.sin(rx);
    const ny = y * c - z * s;
    const nz = y * s + z * c;
    y = ny; z = nz;
  }
  if (ry !== 0) {
    const c = Math.cos(ry), s = Math.sin(ry);
    const nx = x * c + z * s;
    const nz = -x * s + z * c;
    x = nx; z = nz;
  }
  return { x, y, z };
}

function normalize(v: Vec3): Vec3 {
  const len = Math.hypot(v.x, v.y, v.z) || 1;
  return { x: v.x / len, y: v.y / len, z: v.z / len };
}

function buildEllipsoidMesh(
  part: Muscle3DPart,
  latBands: number,
  lonBands: number,
  muscleZone?: MuscleZone,
): Tri3D[] {
  const tris: Tri3D[] = [];
  const { center, radii, rot } = part;
  const rx = rot?.x ?? 0;
  const ry = rot?.y ?? 0;
  const rz = rot?.z ?? 0;

  const grid: Vec3[][] = [];
  for (let lat = 0; lat <= latBands; lat++) {
    const theta = (lat * Math.PI) / latBands;
    const sinT = Math.sin(theta);
    const cosT = Math.cos(theta);
    const row: Vec3[] = [];
    for (let lon = 0; lon <= lonBands; lon++) {
      const phi = (lon * 2 * Math.PI) / lonBands;
      const local: Vec3 = {
        x: radii.x * sinT * Math.cos(phi),
        y: radii.y * cosT,
        z: radii.z * sinT * Math.sin(phi),
      };
      const r = rotatePoint(local, rx, ry, rz);
      row.push({
        x: r.x + center.x,
        y: r.y + center.y,
        z: r.z + center.z,
      });
    }
    grid.push(row);
  }

  for (let lat = 0; lat < latBands; lat++) {
    for (let lon = 0; lon < lonBands; lon++) {
      const a = grid[lat][lon];
      const b = grid[lat + 1][lon];
      const c = grid[lat + 1][lon + 1];
      const d = grid[lat][lon + 1];

      const pushTri = (v0: Vec3, v1: Vec3, v2: Vec3) => {
        const tc = {
          x: (v0.x + v1.x + v2.x) / 3,
          y: (v0.y + v1.y + v2.y) / 3,
          z: (v0.z + v1.z + v2.z) / 3,
        };
        const ux = v1.x - v0.x, uy = v1.y - v0.y, uz = v1.z - v0.z;
        const vx = v2.x - v0.x, vy = v2.y - v0.y, vz = v2.z - v0.z;
        let n = normalize({
          x: uy * vz - uz * vy,
          y: uz * vx - ux * vz,
          z: ux * vy - uy * vx,
        });
        // 외향 법선 보정
        const outX = tc.x - center.x, outY = tc.y - center.y, outZ = tc.z - center.z;
        if (n.x * outX + n.y * outY + n.z * outZ < 0) {
          n = { x: -n.x, y: -n.y, z: -n.z };
        }
        tris.push({ v0, v1, v2, normal: n, center: tc, muscleZone });
      };

      if (lat !== 0) pushTri(a, b, d);
      if (lat !== latBands - 1) pushTri(b, c, d);
    }
  }
  return tris;
}

export function BodyMap({
  activeMuscles = [],
  size = "md",
  initialView = "back",
  showControls = true,
  onMuscleClick,
  className = "",
}: BodyMapProps) {
  // 기본 모드는 3D 입체 뷰! (원클릭으로 2D 전환도 지원)
  const [renderMode, setRenderMode] = useState<"3d" | "2d">("3d");
  const [view, setView] = useState<"front" | "back">(initialView);
  const [hoveredMuscle, setHoveredMuscle] = useState<MuscleZone | null>(null);

  // 3D 카메라 상태 (rotY: 좌우 회전, rotX: 상하 각도, zoom: 배율, panY: 상하 이동)
  const [rotY, setRotY] = useState<number>(initialView === "back" ? Math.PI : 0);
  const [rotX, setRotX] = useState<number>(0.08);
  const [zoom, setZoom] = useState<number>(1.05);
  const [panY, setPanY] = useState<number>(0);
  const [autoRotate, setAutoRotate] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dragRef = useRef<{ dragging: boolean; lastX: number; lastY: number; moved: boolean }>({
    dragging: false,
    lastX: 0,
    lastY: 0,
    moved: false,
  });
  const projectedZonesRef = useRef<
    { zone: MuscleZone; screenX: number; screenY: number; screenR: number; z: number }[]
  >([]);

  const dimensions = {
    sm: { width: 210, height: 290 },
    md: { width: 290, height: 410 },
    lg: { width: 360, height: 490 },
  }[size];

  // 활성화된 근육 목록 정규화
  const activeNormalized = useMemo(() => {
    return activeMuscles.map((m) => m.trim().toLowerCase());
  }, [activeMuscles]);

  const isMuscleActive = useMemo(() => {
    return (zone: MuscleZone) => {
      const zoneName = zone.name.toLowerCase();
      for (const active of activeNormalized) {
        if (!active) continue;
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
  }, [activeNormalized]);

  // 전체 3D 메쉬 사전 빌드 (최초 1회)
  const staticMesh = useMemo(() => {
    const baseTris: Tri3D[] = [];
    for (const part of BASE_MANNEQUIN_PARTS) {
      baseTris.push(...buildEllipsoidMesh(part, 9, 12));
    }
    const muscleTris: Tri3D[] = [];
    for (const zone of MUSCLE_ZONES) {
      for (const part of zone.parts3D) {
        muscleTris.push(...buildEllipsoidMesh(part, 8, 10, zone));
      }
    }
    return { baseTris, muscleTris };
  }, []);

  // 선택된 타겟 근육이 바뀌면 해당 면(앞/뒤)으로 부드럽게 카메라 방향 맞춤 (사용자가 드래그 중이 아닐 때)
  useEffect(() => {
    if (activeMuscles.length === 0) return;
    const activeZones = MUSCLE_ZONES.filter(isMuscleActive);
    if (activeZones.length === 0) return;
    const frontCount = activeZones.filter((z) => z.view === "front").length;
    const backCount = activeZones.filter((z) => z.view === "back").length;
    if (backCount > frontCount) {
      setView("back");
      setRotY(Math.PI - 0.22);
    } else {
      setView("front");
      setRotY(0.22);
    }
  }, [activeMuscles, isMuscleActive]);

  // 3D 렌더링 루프 (펄스 애니메이션 & 자동 회전)
  useEffect(() => {
    if (renderMode !== "3d") return;
    let frameId = 0;
    let startTime = performance.now();

    const render = (now: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const W = dimensions.width;
      const H = dimensions.height;
      if (canvas.width !== W * dpr || canvas.height !== H * dpr) {
        canvas.width = W * dpr;
        canvas.height = H * dpr;
      }
      ctx.save();
      ctx.scale(dpr, dpr);

      if (autoRotate && !dragRef.current.dragging) {
        setRotY((prev) => prev + 0.012);
      }

      const elapsed = (now - startTime) / 1000;
      const pulse = 0.5 + 0.5 * Math.sin(elapsed * 4.2);

      // 1. 배경 그라데이션 & 3D 메디컬 그리드 플로어
      ctx.clearRect(0, 0, W, H);
      const bgGrad = ctx.createRadialGradient(W * 0.5, H * 0.42, 15, W * 0.5, H * 0.5, H * 0.7);
      bgGrad.addColorStop(0, "#1e293b");
      bgGrad.addColorStop(1, "#090d16");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      const cx = W * 0.5;
      const cy = H * 0.5 + panY;
      const fov = 3.8;
      const scale = (Math.min(W, H) * 0.44) * zoom;

      const project = (p: Vec3) => {
        const r = rotatePoint(p, rotX, rotY, 0);
        const perspective = fov / (fov - r.z);
        return {
          x: cx + r.x * scale * perspective,
          y: cy - r.y * scale * perspective,
          z: r.z,
          normalZ: r.z,
          perspective,
        };
      };

      // 바닥 원형 3D 홀로그램 링 렌더링
      ctx.save();
      for (const ringR of [0.38, 0.58, 0.78]) {
        ctx.beginPath();
        for (let i = 0; i <= 48; i++) {
          const ang = (i / 48) * Math.PI * 2;
          const pt = project({ x: Math.cos(ang) * ringR, y: -1.62, z: Math.sin(ang) * ringR });
          if (i === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        }
        ctx.strokeStyle = ringR === 0.58 ? "rgba(20, 184, 166, 0.28)" : "rgba(51, 65, 85, 0.35)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      ctx.restore();

      // 2. 모든 삼각형 변환 및 Z-Sorting (Painter's Algorithm)
      const lightDir = normalize({ x: 0.35, y: 0.45, z: 0.82 });
      interface DrawTri {
        x0: number; y0: number;
        x1: number; y1: number;
        x2: number; y2: number;
        depth: number;
        fill: string;
        stroke?: string;
        isActiveMuscle: boolean;
      }

      const drawList: DrawTri[] = [];

      const pushTransformedTri = (tri: Tri3D, isMuscle: boolean) => {
        const rN = rotatePoint(tri.normal, rotX, rotY, 0);
        // Backface culling (약간의 여유를 두어 실루엣이 매끄럽게 이어지도록 함)
        if (rN.z < -0.15) return;

        const p0 = project(tri.v0);
        const p1 = project(tri.v1);
        const p2 = project(tri.v2);
        const depth = (p0.z + p1.z + p2.z) / 3;

        const diff = Math.max(0, rN.x * lightDir.x + rN.y * lightDir.y + rN.z * lightDir.z);
        const rim = Math.pow(1 - Math.max(0, rN.z), 2.2);

        if (!isMuscle) {
          // 기본 인체 마네킹 홀로그램 셰이딩 (메디컬 슬레이트 블루)
          const r = Math.round(28 + diff * 36 + rim * 18);
          const g = Math.round(42 + diff * 52 + rim * 38);
          const b = Math.round(64 + diff * 72 + rim * 55);
          drawList.push({
            x0: p0.x, y0: p0.y,
            x1: p1.x, y1: p1.y,
            x2: p2.x, y2: p2.y,
            depth,
            fill: `rgba(${r}, ${g}, ${b}, 0.86)`,
            stroke: `rgba(71, 85, 105, 0.18)`,
            isActiveMuscle: false,
          });
          return;
        }

        const zone = tri.muscleZone!;
        const active = isMuscleActive(zone);
        const hovered = hoveredMuscle?.id === zone.id;

        if (active) {
          // 체크된 타겟 근육: 붉은색 네온 발광 + 입체 명암 펄스
          const boost = pulse * 30;
          const r = Math.min(255, Math.round(215 + diff * 40 + boost));
          const g = Math.min(255, Math.round(24 + diff * 45 + (hovered ? 40 : 0)));
          const b = Math.min(255, Math.round(58 + diff * 50 + rim * 40));
          drawList.push({
            x0: p0.x, y0: p0.y,
            x1: p1.x, y1: p1.y,
            x2: p2.x, y2: p2.y,
            depth: depth + 0.025, // 타겟 근육이 마네킹 표면 위로 선명하게 드러나도록 깊이 보정
            fill: `rgba(${r}, ${g}, ${b}, 0.96)`,
            stroke: `rgba(255, 180, 195, ${0.42 + pulse * 0.35})`,
            isActiveMuscle: true,
          });
        } else if (hovered) {
          // 마우스 호버된 근육: 밝은 청록색 하이라이트
          const r = Math.round(45 + diff * 60);
          const g = Math.round(180 + diff * 65);
          const b = Math.round(170 + diff * 65);
          drawList.push({
            x0: p0.x, y0: p0.y,
            x1: p1.x, y1: p1.y,
            x2: p2.x, y2: p2.y,
            depth: depth + 0.018,
            fill: `rgba(${r}, ${g}, ${b}, 0.92)`,
            stroke: "rgba(153, 246, 228, 0.55)",
            isActiveMuscle: false,
          });
        } else {
          // 비활성 근육 결: 은은한 해부학 근육 톤
          const r = Math.round(46 + diff * 44);
          const g = Math.round(58 + diff * 52);
          const b = Math.round(82 + diff * 64);
          drawList.push({
            x0: p0.x, y0: p0.y,
            x1: p1.x, y1: p1.y,
            x2: p2.x, y2: p2.y,
            depth: depth + 0.008,
            fill: `rgba(${r}, ${g}, ${b}, 0.72)`,
            isActiveMuscle: false,
          });
        }
      };

      for (const t of staticMesh.baseTris) pushTransformedTri(t, false);
      for (const t of staticMesh.muscleTris) pushTransformedTri(t, true);

      drawList.sort((a, b) => a.depth - b.depth);

      // 3. 삼각형 렌더링
      ctx.lineJoin = "round";
      for (const d of drawList) {
        ctx.beginPath();
        ctx.moveTo(d.x0, d.y0);
        ctx.lineTo(d.x1, d.y1);
        ctx.lineTo(d.x2, d.y2);
        ctx.closePath();
        ctx.fillStyle = d.fill;
        ctx.fill();
        if (d.stroke) {
          ctx.strokeStyle = d.stroke;
          ctx.lineWidth = d.isActiveMuscle ? 0.65 : 0.35;
          ctx.stroke();
        }
      }

      // 4. 근육 히트박스 계산 및 활성 근육 3D 콜아웃 라벨 표시
      const hitList: { zone: MuscleZone; screenX: number; screenY: number; screenR: number; z: number }[] = [];
      const activeCallouts: { zone: MuscleZone; x: number; y: number; z: number }[] = [];

      for (const zone of MUSCLE_ZONES) {
        let bestPart: { x: number; y: number; z: number; r: number } | null = null;
        for (const part of zone.parts3D) {
          const proj = project(part.center);
          const rScreen = Math.max(part.radii.x, part.radii.y) * scale * proj.perspective;
          if (proj.z > -0.15) {
            hitList.push({ zone, screenX: proj.x, screenY: proj.y, screenR: Math.max(14, rScreen), z: proj.z });
            if (!bestPart || proj.z > bestPart.z) {
              bestPart = { x: proj.x, y: proj.y, z: proj.z, r: rScreen };
            }
          }
        }
        if (bestPart && isMuscleActive(zone) && bestPart.z > -0.05) {
          activeCallouts.push({ zone, x: bestPart.x, y: bestPart.y, z: bestPart.z });
        }
      }
      projectedZonesRef.current = hitList;

      // 활성 근육에 붉은 글로우 후광 및 3D 핀 리더 라인 렌더링 (최대 5개)
      activeCallouts.sort((a, b) => b.z - a.z);
      activeCallouts.slice(0, 5).forEach((c, idx) => {
        // 붉은 오라 글로우
        const glowR = 16 + pulse * 8;
        const g = ctx.createRadialGradient(c.x, c.y, 2, c.x, c.y, glowR);
        g.addColorStop(0, "rgba(244, 63, 94, 0.65)");
        g.addColorStop(1, "rgba(244, 63, 94, 0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(c.x, c.y, glowR, 0, Math.PI * 2);
        ctx.fill();

        // 중심 타겟 도트
        ctx.fillStyle = "#fff1f2";
        ctx.beginPath();
        ctx.arc(c.x, c.y, 2.8, 0, Math.PI * 2);
        ctx.fill();

        // sm 모드가 아닐 때 근육명 3D 플로팅 태그 표시
        if (size !== "sm") {
          const isRightSide = c.x >= cx;
          const labelX = isRightSide ? Math.min(W - 8, c.x + 28) : Math.max(8, c.x - 28);
          const labelY = Math.max(22, Math.min(H - 22, c.y + (idx % 2 === 0 ? -12 : 12)));

          ctx.strokeStyle = "rgba(251, 113, 133, 0.85)";
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(c.x, c.y);
          ctx.lineTo(labelX, labelY);
          ctx.stroke();

          ctx.font = "bold 10px Pretendard, sans-serif";
          const text = c.zone.name;
          const tw = ctx.measureText(text).width + 10;
          const boxX = isRightSide ? labelX : labelX - tw;
          ctx.fillStyle = "rgba(15, 23, 42, 0.88)";
          ctx.strokeStyle = "rgba(244, 63, 94, 0.75)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(boxX, labelY - 9, tw, 18, 4);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = "#fecdd3";
          ctx.textBaseline = "middle";
          ctx.fillText(text, boxX + 5, labelY);
        }
      });

      ctx.restore();
      frameId = requestAnimationFrame(render);
    };

    frameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(frameId);
  }, [renderMode, rotX, rotY, zoom, panY, autoRotate, dimensions.width, dimensions.height, staticMesh, isMuscleActive, hoveredMuscle, size]);

  // 3D 마우스/터치 이벤트 핸들러
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    dragRef.current = { dragging: true, lastX: e.clientX, lastY: e.clientY, moved: false };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    if (dragRef.current.dragging) {
      const dx = e.clientX - dragRef.current.lastX;
      const dy = e.clientY - dragRef.current.lastY;
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) dragRef.current.moved = true;
      dragRef.current.lastX = e.clientX;
      dragRef.current.lastY = e.clientY;
      setRotY((prev) => prev + dx * 0.013);
      setRotX((prev) => Math.max(-0.65, Math.min(0.65, prev + dy * 0.009)));
      return;
    }

    // 호버 히트 테스트 (가장 앞쪽 z 우선)
    let hit: MuscleZone | null = null;
    let bestZ = -999;
    for (const h of projectedZonesRef.current) {
      const dist = Math.hypot(mx - h.screenX, my - h.screenY);
      if (dist <= h.screenR && h.z > bestZ) {
        bestZ = h.z;
        hit = h.zone;
      }
    }
    setHoveredMuscle(hit);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!dragRef.current.moved && hoveredMuscle && onMuscleClick) {
      onMuscleClick(hoveredMuscle.name);
    }
    dragRef.current.dragging = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.12 : 0.9;
    setZoom((z) => Math.max(0.65, Math.min(2.6, Number((z * factor).toFixed(2)))));
  };

  const setCameraPreset = (preset: "front" | "back" | "side" | "upper" | "lower") => {
    setAutoRotate(false);
    if (preset === "front") {
      setView("front");
      setRotY(0);
      setRotX(0.06);
      setZoom(1.05);
      setPanY(0);
    } else if (preset === "back") {
      setView("back");
      setRotY(Math.PI);
      setRotX(0.06);
      setZoom(1.05);
      setPanY(0);
    } else if (preset === "side") {
      setRotY(Math.PI * 0.5);
      setRotX(0.05);
      setZoom(1.05);
      setPanY(0);
    } else if (preset === "upper") {
      setZoom(1.65);
      setPanY(dimensions.height * 0.22);
    } else if (preset === "lower") {
      setZoom(1.55);
      setPanY(-dimensions.height * 0.22);
    }
  };

  // 2D 모드용 근육 목록
  const visibleZones2D = useMemo(() => {
    return MUSCLE_ZONES.filter((z) => z.view === view || z.view === "both");
  }, [view]);

  const totalActiveCount = useMemo(() => {
    return MUSCLE_ZONES.filter(isMuscleActive).length;
  }, [isMuscleActive]);

  return (
    <div
      className={`relative flex flex-col items-center bg-slate-900/95 text-white rounded-2xl p-3.5 border border-slate-800 shadow-xl backdrop-blur select-none ${className}`}
    >
      {/* 상단 헤더 & 3D/2D 전환 컨트롤 */}
      {showControls && (
        <div className="w-full flex flex-wrap items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_#f43f5e]" />
            <span>3D 인체 근육 바디맵</span>
            {totalActiveCount > 0 && (
              <span className="ml-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
                {totalActiveCount}개 타겟 점등
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {/* 3D / 2D 스위치 */}
            <div className="inline-flex rounded-lg bg-slate-800 p-0.5 border border-slate-700 text-[11px]">
              <button
                type="button"
                onClick={() => setRenderMode("3d")}
                className={`flex items-center gap-1 px-2 py-1 rounded-md font-semibold transition-all ${
                  renderMode === "3d" ? "bg-teal-600 text-white shadow-xs" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Box size={12} /> 3D 회전
              </button>
              <button
                type="button"
                onClick={() => setRenderMode("2d")}
                className={`flex items-center gap-1 px-2 py-1 rounded-md font-semibold transition-all ${
                  renderMode === "2d" ? "bg-teal-600 text-white shadow-xs" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Layers size={12} /> 2D 도해
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 카메라 프리셋 & 줌 컨트롤 바 (3D 모드) */}
      {showControls && renderMode === "3d" && (
        <div className="w-full flex flex-wrap items-center justify-between gap-1.5 mb-2 text-[11px]">
          <div className="inline-flex rounded-lg bg-slate-800/90 p-0.5 border border-slate-700/80">
            <button
              type="button"
              onClick={() => setCameraPreset("front")}
              className="px-2 py-1 rounded text-slate-300 hover:bg-slate-700 hover:text-white font-medium"
            >
              전면
            </button>
            <button
              type="button"
              onClick={() => setCameraPreset("back")}
              className="px-2 py-1 rounded text-slate-300 hover:bg-slate-700 hover:text-white font-medium"
            >
              후면
            </button>
            <button
              type="button"
              onClick={() => setCameraPreset("side")}
              className="px-2 py-1 rounded text-slate-300 hover:bg-slate-700 hover:text-white font-medium"
            >
              측면
            </button>
            <button
              type="button"
              onClick={() => setCameraPreset("upper")}
              className="px-2 py-1 rounded text-teal-300 hover:bg-slate-700 font-medium"
              title="목·어깨·상체 확대"
            >
              상체줌
            </button>
            <button
              type="button"
              onClick={() => setCameraPreset("lower")}
              className="px-2 py-1 rounded text-teal-300 hover:bg-slate-700 font-medium"
              title="골반·하지 확대"
            >
              하체줌
            </button>
          </div>

          <div className="inline-flex items-center gap-1">
            <button
              type="button"
              onClick={() => setAutoRotate((v) => !v)}
              title="360도 자동 회전"
              className={`flex items-center gap-1 px-2 py-1 rounded-md border text-[10px] font-semibold ${
                autoRotate
                  ? "bg-rose-600/30 border-rose-500 text-rose-200"
                  : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
              }`}
            >
              {autoRotate ? <Pause size={11} /> : <Play size={11} />}
              360°
            </button>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(2.6, Number((z + 0.25).toFixed(2))))}
              className="p-1.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white"
              title="확대 (Zoom In)"
            >
              <ZoomIn size={13} />
            </button>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(0.65, Number((z - 0.25).toFixed(2))))}
              className="p-1.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white"
              title="축소 (Zoom Out)"
            >
              <ZoomOut size={13} />
            </button>
            <button
              type="button"
              onClick={() => setCameraPreset(initialView)}
              className="p-1.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white"
              title="시점 초기화"
            >
              <RotateCcw size={13} />
            </button>
          </div>
        </div>
      )}

      {/* 2D 모드일 때 전면/후면 탭 */}
      {showControls && renderMode === "2d" && (
        <div className="w-full flex justify-end mb-2">
          <div className="inline-flex rounded-lg bg-slate-800 p-0.5 border border-slate-700 text-xs">
            <button
              type="button"
              onClick={() => setView("front")}
              className={`px-2.5 py-1 rounded-md font-medium ${
                view === "front" ? "bg-rose-600 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              전면 (Front)
            </button>
            <button
              type="button"
              onClick={() => setView("back")}
              className={`px-2.5 py-1 rounded-md font-medium ${
                view === "back" ? "bg-rose-600 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              후면 (Back)
            </button>
          </div>
        </div>
      )}

      {/* 메인 뷰포트 (3D 캔버스 또는 2D SVG) */}
      <div className="relative flex items-center justify-center overflow-hidden rounded-xl border border-slate-800/90 bg-slate-950">
        {renderMode === "3d" ? (
          <canvas
            ref={canvasRef}
            style={{ width: dimensions.width, height: dimensions.height, touchAction: "none" }}
            className="cursor-grab active:cursor-grabbing"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={() => {
              dragRef.current.dragging = false;
              setHoveredMuscle(null);
            }}
            onWheel={handleWheel}
          />
        ) : (
          <svg
            viewBox="0 0 200 380"
            width={dimensions.width}
            height={dimensions.height}
            className="transition-transform duration-300 filter drop-shadow-md"
          >
            <defs>
              <linearGradient id="neonGlowRed" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#e11d48" stopOpacity="0.9" />
              </linearGradient>
              <linearGradient id="neutralBody" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#334155" stopOpacity="0.75" />
                <stop offset="100%" stopColor="#1e293b" stopOpacity="0.9" />
              </linearGradient>
            </defs>
            <g className="fill-slate-800/60 stroke-slate-700/60 stroke-[1]">
              <ellipse cx="100" cy="22" rx="14" ry="17" />
              <path d="M 94 36 L 94 48 L 106 48 L 106 36 Z" />
              <path
                d="M 68 68 Q 60 76 56 100 L 52 145 Q 50 152 46 160 L 52 162 L 58 135 L 62 105 L 70 78 Q 85 66 100 66 Q 115 66 130 78 L 138 105 L 142 135 L 148 162 L 154 160 Q 150 152 148 145 L 144 100 Q 140 76 132 68 Q 118 58 100 58 Q 82 58 68 68 Z"
                fill="none"
                stroke="#475569"
                strokeWidth="1.2"
              />
            </g>
            {visibleZones2D.map((zone) => {
              const active = isMuscleActive(zone);
              const hovered = hoveredMuscle?.id === zone.id;
              return (
                <g
                  key={zone.id}
                  className="cursor-pointer"
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
                    />
                  ))}
                </g>
              );
            })}
          </svg>
        )}

        {/* 좌측 하단 배율 배지 */}
        {renderMode === "3d" && (
          <div className="pointer-events-none absolute left-2.5 bottom-2 flex items-center gap-1.5 rounded-md bg-slate-900/80 px-2 py-0.5 text-[10px] text-slate-300 border border-slate-700/70">
            <Maximize2 size={10} className="text-teal-400" />
            <span>{Math.round(zoom * 100)}%</span>
          </div>
        )}

        {/* 호버 시 근육 해부학 툴팁 */}
        {hoveredMuscle && (
          <div className="pointer-events-none absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between rounded-lg bg-slate-950/90 border border-rose-500/50 px-2.5 py-1.5 text-[11px] shadow-lg z-20">
            <div className="truncate">
              <span className="font-bold text-rose-300">{hoveredMuscle.name}</span>
              {hoveredMuscle.latinName && (
                <span className="ml-1.5 text-[10px] text-slate-400 font-mono">({hoveredMuscle.latinName})</span>
              )}
            </div>
            {isMuscleActive(hoveredMuscle) && (
              <span className="ml-2 shrink-0 rounded bg-rose-600 px-1.5 py-0.5 text-[9px] font-bold text-white">
                집중 타겟
              </span>
            )}
          </div>
        )}
      </div>

      {/* 하단 조작 안내 바 */}
      <div className="w-full mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
          <span className="font-medium text-slate-200">
            {totalActiveCount > 0 ? `${totalActiveCount}개 타겟 근육 3D 점등` : "타겟 근육 대기 중"}
          </span>
        </div>
        <div className="text-[10px] text-slate-400">
          {renderMode === "3d" ? "🖱️ 드래그: 360° 회전 · 휠: 줌인/아웃" : "💡 근육 클릭·호버"}
        </div>
      </div>
    </div>
  );
}

export default BodyMap;
