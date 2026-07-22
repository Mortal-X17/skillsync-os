import type { Roadmap, Phase, Topic, Subtopic } from "./schema";

function subtopicPct(s: Subtopic): number {
  if (s.checklist.length === 0) return s.done ? 100 : 0;
  const done = s.checklist.filter((c) => c.done).length;
  return Math.round((done / s.checklist.length) * 100);
}

export function topicPct(t: Topic): number {
  const parts: number[] = [];
  if (t.checklist.length > 0) {
    parts.push(
      Math.round(
        (t.checklist.filter((c) => c.done).length / t.checklist.length) * 100,
      ),
    );
  }
  if (t.subtopics.length > 0) {
    parts.push(
      Math.round(
        t.subtopics.reduce((sum, s) => sum + subtopicPct(s), 0) /
          t.subtopics.length,
      ),
    );
  }
  if (parts.length === 0) return t.done ? 100 : 0;
  return Math.round(parts.reduce((a, b) => a + b, 0) / parts.length);
}

export function phasePct(p: Phase): number {
  if (p.topics.length === 0) return 0;
  return Math.round(
    p.topics.reduce((s, t) => s + topicPct(t), 0) / p.topics.length,
  );
}

export function roadmapPct(r: Roadmap): number {
  if (r.phases.length === 0) return 0;
  return Math.round(
    r.phases.reduce((s, p) => s + phasePct(p), 0) / r.phases.length,
  );
}

export function roadmapCounts(r: Roadmap) {
  let topics = 0;
  let done = 0;
  for (const p of r.phases) {
    for (const t of p.topics) {
      topics++;
      if (topicPct(t) === 100) done++;
    }
  }
  return { topics, done };
}

export { subtopicPct };
