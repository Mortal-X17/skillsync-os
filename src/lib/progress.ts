import type { Roadmap, Phase, Topic, Subtopic } from "./schema";

/**
 * Progress is derived from checklist "leaves" only.
 * When a subtopic (or topic) has no checklist items, its own `done` flag
 * counts as a single synthetic leaf so pre-existing data still contributes.
 */
export function subtopicLeaves(s: Subtopic): { done: number; total: number } {
  if (s.checklist.length > 0) {
    return {
      done: s.checklist.filter((c) => c.done).length,
      total: s.checklist.length,
    };
  }
  return { done: s.done ? 1 : 0, total: 1 };
}

export function topicLeaves(t: Topic): { done: number; total: number } {
  let done = 0;
  let total = 0;
  if (t.checklist.length > 0) {
    done += t.checklist.filter((c) => c.done).length;
    total += t.checklist.length;
  }
  if (t.subtopics.length > 0) {
    for (const s of t.subtopics) {
      const l = subtopicLeaves(s);
      done += l.done;
      total += l.total;
    }
  }
  if (total === 0) {
    // No checklist and no subtopics anywhere → fall back to topic.done.
    return { done: t.done ? 1 : 0, total: 1 };
  }
  return { done, total };
}

export function phaseLeaves(p: Phase): { done: number; total: number } {
  let done = 0;
  let total = 0;
  for (const t of p.topics) {
    const l = topicLeaves(t);
    done += l.done;
    total += l.total;
  }
  return { done, total };
}

export function roadmapLeaves(r: Roadmap): { done: number; total: number } {
  let done = 0;
  let total = 0;
  for (const p of r.phases) {
    const l = phaseLeaves(p);
    done += l.done;
    total += l.total;
  }
  return { done, total };
}

function pct({ done, total }: { done: number; total: number }): number {
  if (total <= 0) return 0;
  return Math.round((done / total) * 100);
}

export function subtopicPct(s: Subtopic): number {
  return pct(subtopicLeaves(s));
}

export function topicPct(t: Topic): number {
  return pct(topicLeaves(t));
}

export function phasePct(p: Phase): number {
  return pct(phaseLeaves(p));
}

export function roadmapPct(r: Roadmap): number {
  return pct(roadmapLeaves(r));
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
