import { z } from "zod";

export const CURRENT_SCHEMA_VERSION = 1;

export const ChecklistItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  done: z.boolean().default(false),
  createdAt: z.number(),
});

export const ResourceSchema = z.object({
  id: z.string(),
  label: z.string(),
  url: z.string(),
});

export const SubtopicSchema = z.object({
  id: z.string(),
  title: z.string(),
  done: z.boolean().default(false),
  notes: z.string().default(""),
  resources: z.array(ResourceSchema).default([]),
  checklist: z.array(ChecklistItemSchema).default([]),
  createdAt: z.number(),
});

export const TopicSchema = z.object({
  id: z.string(),
  title: z.string(),
  done: z.boolean().default(false),
  notes: z.string().default(""),
  resources: z.array(ResourceSchema).default([]),
  subtopics: z.array(SubtopicSchema).default([]),
  checklist: z.array(ChecklistItemSchema).default([]),
  createdAt: z.number(),
});

export const PhaseSchema = z.object({
  id: z.string(),
  title: z.string(),
  topics: z.array(TopicSchema).default([]),
  createdAt: z.number(),
});

export const RoadmapSchema = z.object({
  id: z.string(),
  title: z.string(),
  subtitle: z.string().default(""),
  color: z.string().default("#7c3aed"),
  phases: z.array(PhaseSchema).default([]),
  createdAt: z.number(),
});

export const NoteSchema = z.object({
  id: z.string(),
  title: z.string(),
  body: z.string().default(""),
  tags: z.array(z.string()).default([]),
  pinned: z.boolean().default(false),
  linkedTo: z
    .object({ type: z.enum(["topic", "subtopic", "project"]), id: z.string() })
    .nullable()
    .default(null),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export const ProjectTaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  done: z.boolean().default(false),
});

export const ProjectSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().default(""),
  status: z.enum(["planning", "active", "done"]).default("planning"),
  progress: z.number().min(0).max(100).default(0),
  deadline: z.string().nullable().default(null),
  techStack: z.array(z.string()).default([]),
  tasks: z.array(ProjectTaskSchema).default([]),
  notes: z.string().default(""),
  githubUrl: z.string().default(""),
  createdAt: z.number(),
});

export const PlannerTaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  date: z.string(), // YYYY-MM-DD
  time: z.string().default(""),
  done: z.boolean().default(false),
  createdAt: z.number(),
});

export const HabitSchema = z.object({
  id: z.string(),
  title: z.string(),
  emoji: z.string().default("✨"),
  createdAt: z.number(),
});

export const HabitLogSchema = z.object({
  habitId: z.string(),
  date: z.string(), // YYYY-MM-DD
});

export const ProfileSchema = z.object({
  name: z.string().default("Learner"),
  avatar: z.string().default(""),
});

export const PreferencesSchema = z.object({
  notifications: z.boolean().default(true),
  developerMode: z.boolean().default(false),
});

export const StatsSchema = z.object({
  xp: z.number().default(0),
  level: z.number().default(1),
  streak: z.number().default(0),
  lastActive: z.string().default(""), // YYYY-MM-DD
});

export const AppDataSchema = z.object({
  schemaVersion: z.number(),
  roadmaps: z.array(RoadmapSchema).default([]),
  notes: z.array(NoteSchema).default([]),
  projects: z.array(ProjectSchema).default([]),
  planner: z.array(PlannerTaskSchema).default([]),
  habits: z.array(HabitSchema).default([]),
  habitLogs: z.array(HabitLogSchema).default([]),
  profile: ProfileSchema.default({ name: "Learner", avatar: "" }),
  preferences: PreferencesSchema.default({
    notifications: true,
    developerMode: false,
  }),
  stats: StatsSchema.default({ xp: 0, level: 1, streak: 0, lastActive: "" }),
});

export type ChecklistItem = z.infer<typeof ChecklistItemSchema>;
export type Resource = z.infer<typeof ResourceSchema>;
export type Subtopic = z.infer<typeof SubtopicSchema>;
export type Topic = z.infer<typeof TopicSchema>;
export type Phase = z.infer<typeof PhaseSchema>;
export type Roadmap = z.infer<typeof RoadmapSchema>;
export type Note = z.infer<typeof NoteSchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type ProjectTask = z.infer<typeof ProjectTaskSchema>;
export type PlannerTask = z.infer<typeof PlannerTaskSchema>;
export type Habit = z.infer<typeof HabitSchema>;
export type HabitLog = z.infer<typeof HabitLogSchema>;
export type Profile = z.infer<typeof ProfileSchema>;
export type Preferences = z.infer<typeof PreferencesSchema>;
export type Stats = z.infer<typeof StatsSchema>;
export type AppData = z.infer<typeof AppDataSchema>;
