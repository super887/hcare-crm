import type { MatchingDataset, ProgramRecommendation, RecommendationResult } from "@/types/hcare";

/**
 * 규칙 기반 맞춤 프로그램 추천 엔진 (AI 미적용)
 *
 * MatchScore(P) = Σ weight(o, P)  (선택된 관찰 항목 o 중 프로그램 P와 연결된 규칙의 가중치 합)
 *
 * 향후 AI 연동 시 이 함수 시그니처(입력: 관찰 항목 ID 배열 + 데이터셋, 출력: RecommendationResult)를
 * 유지한 채 내부 구현만 교체하면 UI 수정 없이 업그레이드할 수 있습니다.
 */
export function getRecommendedPrograms(
  selectedObservationIds: string[],
  dataset: MatchingDataset,
): RecommendationResult {
  const selected = new Set(selectedObservationIds);
  if (selected.size === 0) return { recommendations: [], focusMuscles: [] };

  const obsById = new Map(dataset.observations.map((o) => [o.id, o]));
  const exById = new Map(dataset.exercises.map((e) => [e.id, e]));

  // 프로그램별 매칭 규칙 수집 (비활성 항목/프로그램 제외)
  const matched = new Map<string, ProgramRecommendation["matchedObservations"]>();
  for (const rule of dataset.rules) {
    if (!selected.has(rule.observationId)) continue;
    const observation = obsById.get(rule.observationId);
    if (!observation || !observation.isActive) continue;
    const list = matched.get(rule.programId) ?? [];
    list.push({ observation, weight: rule.priorityWeight, rationaleNote: rule.rationaleNote });
    matched.set(rule.programId, list);
  }

  const recommendations: ProgramRecommendation[] = [];
  for (const program of dataset.programs) {
    if (!program.isActive) continue;
    const matchedObservations = matched.get(program.id);
    if (!matchedObservations || matchedObservations.length === 0) continue;

    const matchScore = matchedObservations.reduce((sum, m) => sum + m.weight, 0);
    const recommendedExercises = dataset.programExerciseMaps
      .filter((m) => m.programId === program.id)
      .map((m) => exById.get(m.exerciseId))
      .filter((e): e is NonNullable<typeof e> => !!e && e.isActive);

    recommendations.push({ program, matchScore, matchedObservations, recommendedExercises });
  }

  // 점수 내림차순, 동점이면 매칭된 관찰 항목 수 많은 순
  recommendations.sort(
    (a, b) =>
      b.matchScore - a.matchScore ||
      b.matchedObservations.length - a.matchedObservations.length ||
      a.program.title.localeCompare(b.program.title, "ko"),
  );

  // 중점 타겟 근육: 각 근육이 속한 추천 프로그램의 점수 합
  const muscleScore = new Map<string, number>();
  for (const r of recommendations) {
    for (const muscle of r.program.targetMuscles) {
      muscleScore.set(muscle, (muscleScore.get(muscle) ?? 0) + r.matchScore);
    }
  }
  const focusMuscles = [...muscleScore.entries()]
    .map(([muscle, score]) => ({ muscle, score }))
    .sort((a, b) => b.score - a.score || a.muscle.localeCompare(b.muscle, "ko"));

  return { recommendations, focusMuscles };
}
