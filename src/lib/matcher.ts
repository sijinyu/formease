import { ProfileKey } from "@/types/profile";
import { FieldSignal } from "./detector";
import { PATTERN_DICTIONARY, PatternEntry } from "./patterns";

export interface MatchResult {
  readonly field: FieldSignal;
  readonly profileKey: ProfileKey;
  readonly confidence: number;
}

function matchAutocomplete(
  signal: FieldSignal,
  entry: PatternEntry,
): number {
  if (!signal.autocomplete) return 0;
  const ac = signal.autocomplete.toLowerCase();
  return entry.autocomplete.some((a) => ac === a) ? 1.0 : 0;
}

function matchInputType(signal: FieldSignal, entry: PatternEntry): number {
  if (entry.inputTypes.length === 0) return 0;
  return entry.inputTypes.some((t) => signal.type === t) ? 0.8 : 0;
}

interface WeightedSignal {
  readonly text: string | undefined;
  readonly weight: number;
}

function matchPatterns(signal: FieldSignal, entry: PatternEntry): number {
  const weightedSignals: readonly WeightedSignal[] = [
    { text: signal.name, weight: 0.8 },
    { text: signal.id, weight: 0.8 },
    { text: signal.placeholder, weight: 0.6 },
    { text: signal.ariaLabel, weight: 0.7 },
    { text: signal.labelText, weight: 0.7 },
    { text: signal.siblingText, weight: 0.5 },
  ];

  let matchCount = 0;
  let bestScore = 0;

  for (const { text, weight } of weightedSignals) {
    if (!text) continue;
    for (const pattern of entry.patterns) {
      if (pattern.test(text)) {
        matchCount++;
        bestScore = Math.max(bestScore, weight);
        break;
      }
    }
  }

  if (matchCount === 0) return 0;
  // 복합 시그널 보너스: 2개 이상 매칭 시 +0.15
  if (matchCount >= 2) {
    return Math.min(bestScore + 0.15, 1.0);
  }
  return bestScore;
}

function scoreMatch(signal: FieldSignal, entry: PatternEntry): number {
  const scores = [
    matchAutocomplete(signal, entry),
    matchInputType(signal, entry),
    matchPatterns(signal, entry),
  ];

  return Math.max(...scores);
}

export function matchFields(
  fields: readonly FieldSignal[],
): readonly MatchResult[] {
  const results: MatchResult[] = [];
  const usedKeys = new Set<ProfileKey>();
  const usedElements = new Set<HTMLElement>();

  const candidates: Array<{
    field: FieldSignal;
    entry: PatternEntry;
    score: number;
  }> = [];

  for (const field of fields) {
    for (const entry of PATTERN_DICTIONARY) {
      const score = scoreMatch(field, entry);
      if (score >= 0.5) {
        candidates.push({ field, entry, score });
      }
    }
  }

  candidates.sort((a, b) => b.score - a.score);

  for (const { field, entry, score } of candidates) {
    if (usedKeys.has(entry.key)) continue;
    if (usedElements.has(field.element)) continue;

    usedKeys.add(entry.key);
    usedElements.add(field.element);

    results.push({
      field,
      profileKey: entry.key,
      confidence: score,
    });
  }

  return results;
}
