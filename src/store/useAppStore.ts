import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  AppData,
  Roadmap,
  Phase,
  Topic,
  Subtopic,
  ChecklistItem,
  Note,
  Project,
  ProjectTask,
  PlannerTask,
  Habit,
  Preferences,
  Profile,
  Stats,
} from "@/lib/schema";
import { AppDataSchema } from "@/lib/schema";
import { createInitialData } from "@/lib/seed";
import { migrate } from "@/lib/migrations";
import { newId } from "@/lib/id";
import { todayISO } from "@/lib/date";

type State = AppData & {
  _hydrated: boolean;
  markHydrated: () => void;

  // roadmap ops
  addRoadmap: (title: string) => void;
  renameRoadmap: (id: string, title: string) => void;
  deleteRoadmap: (id: string) => void;
  importRoadmap: (roadmap: Roadmap) => void;
  replaceRoadmap: (id: string, roadmap: Roadmap) => void;

  addPhase: (roadmapId: string, title: string) => void;
  renamePhase: (roadmapId: string, phaseId: string, title: string) => void;
  deletePhase: (roadmapId: string, phaseId: string) => void;
  movePhase: (roadmapId: string, phaseId: string, dir: -1 | 1) => void;

  addTopic: (roadmapId: string, phaseId: string, title: string) => void;
  updateTopic: (
    roadmapId: string,
    phaseId: string,
    topicId: string,
    patch: Partial<Topic>,
  ) => void;
  deleteTopic: (roadmapId: string, phaseId: string, topicId: string) => void;
  moveTopic: (
    roadmapId: string,
    phaseId: string,
    topicId: string,
    dir: -1 | 1,
  ) => void;

  addSubtopic: (
    roadmapId: string,
    phaseId: string,
    topicId: string,
    title: string,
  ) => void;
  updateSubtopic: (
    roadmapId: string,
    phaseId: string,
    topicId: string,
    subtopicId: string,
    patch: Partial<Subtopic>,
  ) => void;
  deleteSubtopic: (
    roadmapId: string,
    phaseId: string,
    topicId: string,
    subtopicId: string,
  ) => void;

  addChecklistItem: (
    path: {
      roadmapId: string;
      phaseId: string;
      topicId: string;
      subtopicId?: string;
    },
    title: string,
  ) => void;
  updateChecklistItem: (
    path: {
      roadmapId: string;
      phaseId: string;
      topicId: string;
      subtopicId?: string;
    },
    itemId: string,
    patch: Partial<ChecklistItem>,
  ) => void;
  deleteChecklistItem: (
    path: {
      roadmapId: string;
      phaseId: string;
      topicId: string;
      subtopicId?: string;
    },
    itemId: string,
  ) => void;

  // notes
  addNote: (partial?: Partial<Note>) => Note;
  updateNote: (id: string, patch: Partial<Note>) => void;
  deleteNote: (id: string) => void;

  // projects
  addProject: (partial?: Partial<Project>) => Project;
  updateProject: (id: string, patch: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  addProjectTask: (projectId: string, title: string) => void;
  updateProjectTask: (
    projectId: string,
    taskId: string,
    patch: Partial<ProjectTask>,
  ) => void;
  deleteProjectTask: (projectId: string, taskId: string) => void;

  // planner
  addPlannerTask: (partial: Partial<PlannerTask> & { date: string }) => void;
  updatePlannerTask: (id: string, patch: Partial<PlannerTask>) => void;
  deletePlannerTask: (id: string) => void;

  // habits
  addHabit: (title: string, emoji?: string) => void;
  renameHabit: (id: string, title: string) => void;
  deleteHabit: (id: string) => void;
  toggleHabitToday: (id: string, dateISO?: string) => void;

  // profile / prefs / stats
  updateProfile: (patch: Partial<Profile>) => void;
  updatePreferences: (patch: Partial<Preferences>) => void;
  addXp: (amount: number) => void;
  touchStreak: () => void;

  // backup
  exportJSON: () => string;
  importJSON: (input: string) => { ok: boolean; error?: string };
  resetAll: () => void;
};

const STORAGE_KEY = "skillsync:data:v1";

function updateRoadmap(
  state: State,
  id: string,
  fn: (r: Roadmap) => Roadmap,
): Partial<State> {
  return {
    roadmaps: state.roadmaps.map((r) => (r.id === id ? fn(r) : r)),
  };
}

function updatePhase(
  state: State,
  roadmapId: string,
  phaseId: string,
  fn: (p: Phase) => Phase,
): Partial<State> {
  return updateRoadmap(state, roadmapId, (r) => ({
    ...r,
    phases: r.phases.map((p) => (p.id === phaseId ? fn(p) : p)),
  }));
}

function updateTopicIn(
  state: State,
  roadmapId: string,
  phaseId: string,
  topicId: string,
  fn: (t: Topic) => Topic,
): Partial<State> {
  return updatePhase(state, roadmapId, phaseId, (p) => ({
    ...p,
    topics: p.topics.map((t) => (t.id === topicId ? fn(t) : t)),
  }));
}

function move<T>(arr: T[], idx: number, dir: -1 | 1): T[] {
  const j = idx + dir;
  if (j < 0 || j >= arr.length) return arr;
  const copy = arr.slice();
  const [item] = copy.splice(idx, 1);
  copy.splice(j, 0, item);
  return copy;
}

export const useAppStore = create<State>()(
  persist(
    (set, get) => ({
      ...createInitialData(),
      _hydrated: false,
      markHydrated: () => set({ _hydrated: true }),

      addRoadmap: (title) =>
        set((s) => ({
          roadmaps: [
            ...s.roadmaps,
            {
              id: newId(),
              title,
              subtitle: "",
              color: "#7c3aed",
              phases: [],
              createdAt: Date.now(),
            },
          ],
        })),
      renameRoadmap: (id, title) =>
        set((s) => updateRoadmap(s, id, (r) => ({ ...r, title }))),
      deleteRoadmap: (id) =>
        set((s) => ({ roadmaps: s.roadmaps.filter((r) => r.id !== id) })),

      addPhase: (roadmapId, title) =>
        set((s) =>
          updateRoadmap(s, roadmapId, (r) => ({
            ...r,
            phases: [
              ...r.phases,
              { id: newId(), title, topics: [], createdAt: Date.now() },
            ],
          })),
        ),
      renamePhase: (roadmapId, phaseId, title) =>
        set((s) => updatePhase(s, roadmapId, phaseId, (p) => ({ ...p, title }))),
      deletePhase: (roadmapId, phaseId) =>
        set((s) =>
          updateRoadmap(s, roadmapId, (r) => ({
            ...r,
            phases: r.phases.filter((p) => p.id !== phaseId),
          })),
        ),
      movePhase: (roadmapId, phaseId, dir) =>
        set((s) =>
          updateRoadmap(s, roadmapId, (r) => {
            const idx = r.phases.findIndex((p) => p.id === phaseId);
            if (idx < 0) return r;
            return { ...r, phases: move(r.phases, idx, dir) };
          }),
        ),

      addTopic: (roadmapId, phaseId, title) =>
        set((s) =>
          updatePhase(s, roadmapId, phaseId, (p) => ({
            ...p,
            topics: [
              ...p.topics,
              {
                id: newId(),
                title,
                done: false,
                notes: "",
                resources: [],
                subtopics: [],
                checklist: [],
                createdAt: Date.now(),
              },
            ],
          })),
        ),
      updateTopic: (roadmapId, phaseId, topicId, patch) =>
        set((s) =>
          updateTopicIn(s, roadmapId, phaseId, topicId, (t) => ({
            ...t,
            ...patch,
          })),
        ),
      deleteTopic: (roadmapId, phaseId, topicId) =>
        set((s) =>
          updatePhase(s, roadmapId, phaseId, (p) => ({
            ...p,
            topics: p.topics.filter((t) => t.id !== topicId),
          })),
        ),
      moveTopic: (roadmapId, phaseId, topicId, dir) =>
        set((s) =>
          updatePhase(s, roadmapId, phaseId, (p) => {
            const idx = p.topics.findIndex((t) => t.id === topicId);
            if (idx < 0) return p;
            return { ...p, topics: move(p.topics, idx, dir) };
          }),
        ),

      addSubtopic: (roadmapId, phaseId, topicId, title) =>
        set((s) =>
          updateTopicIn(s, roadmapId, phaseId, topicId, (t) => ({
            ...t,
            subtopics: [
              ...t.subtopics,
              {
                id: newId(),
                title,
                done: false,
                notes: "",
                resources: [],
                checklist: [],
                createdAt: Date.now(),
              },
            ],
          })),
        ),
      updateSubtopic: (roadmapId, phaseId, topicId, subtopicId, patch) =>
        set((s) =>
          updateTopicIn(s, roadmapId, phaseId, topicId, (t) => ({
            ...t,
            subtopics: t.subtopics.map((sub) =>
              sub.id === subtopicId ? { ...sub, ...patch } : sub,
            ),
          })),
        ),
      deleteSubtopic: (roadmapId, phaseId, topicId, subtopicId) =>
        set((s) =>
          updateTopicIn(s, roadmapId, phaseId, topicId, (t) => ({
            ...t,
            subtopics: t.subtopics.filter((sub) => sub.id !== subtopicId),
          })),
        ),

      addChecklistItem: (path, title) =>
        set((s) =>
          updateTopicIn(s, path.roadmapId, path.phaseId, path.topicId, (t) => {
            const item: ChecklistItem = {
              id: newId(),
              title,
              done: false,
              createdAt: Date.now(),
            };
            if (path.subtopicId) {
              return {
                ...t,
                subtopics: t.subtopics.map((sub) =>
                  sub.id === path.subtopicId
                    ? { ...sub, checklist: [...sub.checklist, item] }
                    : sub,
                ),
              };
            }
            return { ...t, checklist: [...t.checklist, item] };
          }),
        ),
      updateChecklistItem: (path, itemId, patch) =>
        set((s) =>
          updateTopicIn(s, path.roadmapId, path.phaseId, path.topicId, (t) => {
            if (path.subtopicId) {
              return {
                ...t,
                subtopics: t.subtopics.map((sub) =>
                  sub.id === path.subtopicId
                    ? {
                        ...sub,
                        checklist: sub.checklist.map((c) =>
                          c.id === itemId ? { ...c, ...patch } : c,
                        ),
                      }
                    : sub,
                ),
              };
            }
            return {
              ...t,
              checklist: t.checklist.map((c) =>
                c.id === itemId ? { ...c, ...patch } : c,
              ),
            };
          }),
        ),
      deleteChecklistItem: (path, itemId) =>
        set((s) =>
          updateTopicIn(s, path.roadmapId, path.phaseId, path.topicId, (t) => {
            if (path.subtopicId) {
              return {
                ...t,
                subtopics: t.subtopics.map((sub) =>
                  sub.id === path.subtopicId
                    ? {
                        ...sub,
                        checklist: sub.checklist.filter((c) => c.id !== itemId),
                      }
                    : sub,
                ),
              };
            }
            return {
              ...t,
              checklist: t.checklist.filter((c) => c.id !== itemId),
            };
          }),
        ),

      addNote: (partial) => {
        const now = Date.now();
        const note: Note = {
          id: newId(),
          title: partial?.title ?? "Untitled note",
          body: partial?.body ?? "",
          tags: partial?.tags ?? [],
          pinned: partial?.pinned ?? false,
          linkedTo: partial?.linkedTo ?? null,
          createdAt: now,
          updatedAt: now,
        };
        set((s) => ({ notes: [note, ...s.notes] }));
        return note;
      },
      updateNote: (id, patch) =>
        set((s) => ({
          notes: s.notes.map((n) =>
            n.id === id ? { ...n, ...patch, updatedAt: Date.now() } : n,
          ),
        })),
      deleteNote: (id) =>
        set((s) => ({ notes: s.notes.filter((n) => n.id !== id) })),

      addProject: (partial) => {
        const project: Project = {
          id: newId(),
          title: partial?.title ?? "New project",
          description: partial?.description ?? "",
          status: partial?.status ?? "planning",
          progress: partial?.progress ?? 0,
          deadline: partial?.deadline ?? null,
          techStack: partial?.techStack ?? [],
          tasks: partial?.tasks ?? [],
          notes: partial?.notes ?? "",
          githubUrl: partial?.githubUrl ?? "",
          createdAt: Date.now(),
        };
        set((s) => ({ projects: [project, ...s.projects] }));
        return project;
      },
      updateProject: (id, patch) =>
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === id ? { ...p, ...patch } : p,
          ),
        })),
      deleteProject: (id) =>
        set((s) => ({ projects: s.projects.filter((p) => p.id !== id) })),
      addProjectTask: (projectId, title) =>
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  tasks: [
                    ...p.tasks,
                    { id: newId(), title, done: false },
                  ],
                }
              : p,
          ),
        })),
      updateProjectTask: (projectId, taskId, patch) =>
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  tasks: p.tasks.map((t) =>
                    t.id === taskId ? { ...t, ...patch } : t,
                  ),
                }
              : p,
          ),
        })),
      deleteProjectTask: (projectId, taskId) =>
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === projectId
              ? { ...p, tasks: p.tasks.filter((t) => t.id !== taskId) }
              : p,
          ),
        })),

      addPlannerTask: (partial) =>
        set((s) => ({
          planner: [
            ...s.planner,
            {
              id: newId(),
              title: partial.title ?? "New task",
              date: partial.date,
              time: partial.time ?? "",
              done: partial.done ?? false,
              createdAt: Date.now(),
            },
          ],
        })),
      updatePlannerTask: (id, patch) =>
        set((s) => ({
          planner: s.planner.map((t) =>
            t.id === id ? { ...t, ...patch } : t,
          ),
        })),
      deletePlannerTask: (id) =>
        set((s) => ({ planner: s.planner.filter((t) => t.id !== id) })),

      addHabit: (title, emoji = "✨") =>
        set((s) => ({
          habits: [
            ...s.habits,
            { id: newId(), title, emoji, createdAt: Date.now() },
          ],
        })),
      renameHabit: (id, title) =>
        set((s) => ({
          habits: s.habits.map((h) => (h.id === id ? { ...h, title } : h)),
        })),
      deleteHabit: (id) =>
        set((s) => ({
          habits: s.habits.filter((h) => h.id !== id),
          habitLogs: s.habitLogs.filter((l) => l.habitId !== id),
        })),
      toggleHabitToday: (id, dateISO) => {
        const date = dateISO ?? todayISO();
        const existing = get().habitLogs.find(
          (l) => l.habitId === id && l.date === date,
        );
        if (existing) {
          set((s) => ({
            habitLogs: s.habitLogs.filter(
              (l) => !(l.habitId === id && l.date === date),
            ),
          }));
        } else {
          set((s) => ({
            habitLogs: [...s.habitLogs, { habitId: id, date }],
          }));
          get().touchStreak();
          get().addXp(5);
        }
      },

      updateProfile: (patch) =>
        set((s) => ({ profile: { ...s.profile, ...patch } })),
      updatePreferences: (patch) =>
        set((s) => ({ preferences: { ...s.preferences, ...patch } })),
      addXp: (amount) =>
        set((s) => {
          const xp = Math.max(0, s.stats.xp + amount);
          const level = 1 + Math.floor(xp / 100);
          return { stats: { ...s.stats, xp, level } };
        }),
      touchStreak: () =>
        set((s) => {
          const today = todayISO();
          if (s.stats.lastActive === today) return {};
          const yesterday = todayISO(new Date(Date.now() - 86400000));
          const streak =
            s.stats.lastActive === yesterday ? s.stats.streak + 1 : 1;
          return {
            stats: { ...s.stats, streak, lastActive: today },
          };
        }),

      exportJSON: () => {
        const { _hydrated, markHydrated, ...rest } = get() as any;
        void _hydrated;
        void markHydrated;
        // strip functions
        const data: AppData = {
          schemaVersion: rest.schemaVersion,
          roadmaps: rest.roadmaps,
          notes: rest.notes,
          projects: rest.projects,
          planner: rest.planner,
          habits: rest.habits,
          habitLogs: rest.habitLogs,
          profile: rest.profile,
          preferences: rest.preferences,
          stats: rest.stats,
        };
        return JSON.stringify(data, null, 2);
      },
      importJSON: (input) => {
        try {
          const parsed = JSON.parse(input);
          const migrated = migrate(parsed);
          const valid = AppDataSchema.parse(migrated);
          set({ ...valid });
          return { ok: true };
        } catch (e: any) {
          return { ok: false, error: e?.message ?? "Invalid file" };
        }
      },
      resetAll: () => set({ ...createInitialData() }),
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() =>
        typeof window !== "undefined"
          ? window.localStorage
          : (undefined as any),
      ),
      partialize: (state) => {
        const {
          _hydrated,
          markHydrated,
          addRoadmap,
          renameRoadmap,
          deleteRoadmap,
          addPhase,
          renamePhase,
          deletePhase,
          movePhase,
          addTopic,
          updateTopic,
          deleteTopic,
          moveTopic,
          addSubtopic,
          updateSubtopic,
          deleteSubtopic,
          addChecklistItem,
          updateChecklistItem,
          deleteChecklistItem,
          addNote,
          updateNote,
          deleteNote,
          addProject,
          updateProject,
          deleteProject,
          addProjectTask,
          updateProjectTask,
          deleteProjectTask,
          addPlannerTask,
          updatePlannerTask,
          deletePlannerTask,
          addHabit,
          renameHabit,
          deleteHabit,
          toggleHabitToday,
          updateProfile,
          updatePreferences,
          addXp,
          touchStreak,
          exportJSON,
          importJSON,
          resetAll,
          ...data
        } = state;
        void _hydrated;
        void markHydrated;
        void addRoadmap;
        void renameRoadmap;
        void deleteRoadmap;
        void addPhase;
        void renamePhase;
        void deletePhase;
        void movePhase;
        void addTopic;
        void updateTopic;
        void deleteTopic;
        void moveTopic;
        void addSubtopic;
        void updateSubtopic;
        void deleteSubtopic;
        void addChecklistItem;
        void updateChecklistItem;
        void deleteChecklistItem;
        void addNote;
        void updateNote;
        void deleteNote;
        void addProject;
        void updateProject;
        void deleteProject;
        void addProjectTask;
        void updateProjectTask;
        void deleteProjectTask;
        void addPlannerTask;
        void updatePlannerTask;
        void deletePlannerTask;
        void addHabit;
        void renameHabit;
        void deleteHabit;
        void toggleHabitToday;
        void updateProfile;
        void updatePreferences;
        void addXp;
        void touchStreak;
        void exportJSON;
        void importJSON;
        void resetAll;
        return data;
      },
      onRehydrateStorage: () => (state) => {
        state?.markHydrated();
      },
      migrate: (persistedState) => migrate(persistedState) as any,
    },
  ),
);

export function useHydrated() {
  return useAppStore((s) => s._hydrated);
}
