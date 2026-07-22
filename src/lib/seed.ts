import { newId } from "./id";
import type { AppData, Roadmap, Habit } from "./schema";
import { CURRENT_SCHEMA_VERSION } from "./schema";

function makeRoadmap(title: string, subtitle: string, color: string): Roadmap {
  return {
    id: newId(),
    title,
    subtitle,
    color,
    phases: [],
    createdAt: Date.now(),
  };
}

function makeHabit(title: string, emoji: string): Habit {
  return { id: newId(), title, emoji, createdAt: Date.now() };
}

export function createInitialData(): AppData {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    roadmaps: [
      makeRoadmap("Python", "Foundations → Mastery", "#7c3aed"),
      makeRoadmap("AI / Machine Learning", "Math · Models · Systems", "#2563eb"),
      makeRoadmap("DSA", "Patterns · Problems", "#18181b"),
      makeRoadmap("Web Development", "Frontend · Backend · Infra", "#db2777"),
    ],
    notes: [],
    projects: [],
    planner: [],
    habits: [
      makeHabit("Sleep", "😴"),
      makeHabit("Workout", "🏋️"),
      makeHabit("Reading", "📖"),
      makeHabit("Coding", "💻"),
      makeHabit("Walking", "🚶"),
      makeHabit("Meditation", "🧘"),
    ],
    habitLogs: [],
    profile: { name: "Learner", avatar: "" },
    preferences: { notifications: true, developerMode: false },
    stats: { xp: 0, level: 1, streak: 0, lastActive: "" },
  };
}
