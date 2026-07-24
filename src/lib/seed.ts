import { newId } from "./id";
import type { AppData, Roadmap, Habit, Phase, Topic } from "./schema";
import { CURRENT_SCHEMA_VERSION } from "./schema";
import { todayISO } from "./date";

function makeTopic(title: string): Topic {
  return {
    id: newId(),
    title,
    done: false,
    notes: "",
    resources: [],
    subtopics: [],
    checklist: [],
    createdAt: Date.now(),
  };
}

function makePhase(title: string, topics: string[]): Phase {
  return {
    id: newId(),
    title,
    topics: topics.map(makeTopic),
    createdAt: Date.now(),
  };
}

function makeRoadmap(
  title: string,
  subtitle: string,
  color: string,
  phases: Phase[] = [],
): Roadmap {
  return {
    id: newId(),
    title,
    subtitle,
    color,
    phases,
    createdAt: Date.now(),
  };
}

function makeHabit(title: string, emoji: string): Habit {
  return { id: newId(), title, emoji, createdAt: Date.now(), startDate: todayISO() };
}

export function createInitialData(): AppData {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    roadmaps: [
      makeRoadmap("Python", "Foundations → Mastery", "#7c3aed", [
        makePhase("Foundations", [
          "Syntax & variables",
          "Data types & operators",
          "Control flow",
          "Functions & scope",
        ]),
        makePhase("Core", [
          "Collections (list, dict, set, tuple)",
          "Comprehensions",
          "Modules & packages",
          "File I/O",
          "Errors & exceptions",
        ]),
        makePhase("Intermediate", [
          "OOP: classes & inheritance",
          "Iterators & generators",
          "Decorators",
          "Context managers",
          "Typing & dataclasses",
        ]),
        makePhase("Advanced", [
          "Async & concurrency",
          "Testing (pytest)",
          "Packaging & virtualenvs",
          "Performance & profiling",
        ]),
      ]),
      makeRoadmap("AI / Machine Learning", "Math · Models · Systems", "#2563eb", [
        makePhase("Math foundations", [
          "Linear algebra",
          "Probability & statistics",
          "Calculus for ML",
        ]),
        makePhase("Classical ML", [
          "Regression & classification",
          "Trees & ensembles",
          "Clustering & PCA",
          "Model evaluation",
        ]),
        makePhase("Deep learning", [
          "Neural networks basics",
          "CNNs",
          "RNNs & transformers",
          "Training tricks & regularization",
        ]),
        makePhase("LLMs & applied AI", [
          "Prompting & fine-tuning",
          "Embeddings & RAG",
          "Agents & tools",
          "Evaluation & safety",
        ]),
      ]),
      makeRoadmap("DSA", "Patterns · Problems", "#18181b", [
        makePhase("Foundations", [
          "Big-O & complexity",
          "Arrays & strings",
          "Hash maps & sets",
        ]),
        makePhase("Linear structures", [
          "Two pointers",
          "Sliding window",
          "Stacks & queues",
          "Linked lists",
        ]),
        makePhase("Non-linear", [
          "Trees & BSTs",
          "Heaps",
          "Graphs (BFS / DFS)",
          "Tries",
        ]),
        makePhase("Algorithms", [
          "Binary search",
          "Recursion & backtracking",
          "Greedy",
          "Dynamic programming",
        ]),
      ]),
      makeRoadmap("Web Development", "Frontend · Backend · Infra", "#db2777", [
        makePhase("Frontend", [
          "HTML & semantic markup",
          "CSS & responsive design",
          "JavaScript essentials",
          "React fundamentals",
        ]),
        makePhase("Backend", [
          "HTTP & REST",
          "Databases & SQL",
          "Auth & sessions",
          "APIs",
        ]),
        makePhase("Infra & delivery", [
          "Git & workflows",
          "CI/CD",
          "Deployment & hosting",
          "Observability",
        ]),
      ]),
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
    preferences: {
      notifications: true,
      developerMode: false,
      modules: { attendance: false, expenses: false },
    },
    stats: { xp: 0, level: 1, streak: 0, lastActive: "" },
    attendance: { subjects: [] },
    expenses: { transactions: [] },
  };
}
