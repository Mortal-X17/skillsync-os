import { CURRENT_SCHEMA_VERSION, AppDataSchema, type AppData } from "./schema";
import { createInitialData } from "./seed";
import { todayISO } from "./date";
import { createDefaultNotifications } from "./notifications/types";

/**
 * v1 → v2: adds habit.startDate, attendance module, expenses module,
 * preferences.modules flags.
 */
const migrators: Record<number, (data: any) => any> = {
  1: (data) => {
    const habits = Array.isArray(data.habits)
      ? data.habits.map((h: any) => {
          if (h && typeof h === "object" && h.startDate === undefined) {
            const createdAt = typeof h.createdAt === "number" ? h.createdAt : Date.now();
            return { ...h, startDate: todayISO(new Date(createdAt)) };
          }
          return h;
        })
      : [];
    const preferences = {
      notifications: true,
      developerMode: false,
      modules: { attendance: false, expenses: false },
      ...(data.preferences ?? {}),
    };
    if (!preferences.modules) preferences.modules = { attendance: false, expenses: false };
    return {
      ...data,
      habits,
      preferences,
      attendance: data.attendance ?? { subjects: [] },
      expenses: data.expenses ?? { transactions: [] },
    };
  },
  3: (data) => ({
    ...data,
    notifications: data.notifications ?? createDefaultNotifications(),
  }),
  2: (data) => ({
    ...data,
    preferences: {
      ...(data.preferences ?? {}),
      background: (data.preferences ?? {}).background ?? "aurora",
    },
  }),
};

export function migrate(input: unknown): AppData {
  const seed = createInitialData();
  if (!input || typeof input !== "object") return seed;

  let data: any = { ...seed, ...(input as any) };
  const from = typeof data.schemaVersion === "number" ? data.schemaVersion : 0;

  for (let v = from; v < CURRENT_SCHEMA_VERSION; v++) {
    const fn = migrators[v];
    if (fn) data = fn(data);
  }
  data.schemaVersion = CURRENT_SCHEMA_VERSION;

  // Defensive: guarantee shape even if older persisted state slipped through.
  data.preferences = {
    notifications: true,
    developerMode: false,
    background: "aurora",
    theme: "dark",
    auroraSpeed: 0.12,
    ...(data.preferences ?? {}),
    auroraSpeed:
      typeof (data.preferences ?? {}).auroraSpeed === "number"
        ? (data.preferences ?? {}).auroraSpeed
        : 0.12,
    modules: {
      attendance: false,
      expenses: false,
      ...((data.preferences ?? {}).modules ?? {}),
    },
  };
  data.attendance = data.attendance ?? { subjects: [] };
  data.expenses = data.expenses ?? { transactions: [] };
  // Expense Manager V2: description / tags / position / updatedAt
  data.expenses.transactions = (data.expenses.transactions ?? []).map(
    (t: any, i: number) => ({
      ...t,
      description: t.description ?? "",
      tags: Array.isArray(t.tags) ? t.tags : [],
      position: typeof t.position === "number" ? t.position : i,
      updatedAt: typeof t.updatedAt === "number" ? t.updatedAt : (t.at ?? 0),
    }),
  );
  {
    const defaults = createDefaultNotifications();
    const n = data.notifications ?? {};
    data.notifications = {
      settings: {
        ...defaults.settings,
        ...(n.settings ?? {}),
        categories: {
          ...defaults.settings.categories,
          ...((n.settings ?? {}).categories ?? {}),
        },
        quietHours: {
          ...defaults.settings.quietHours,
          ...((n.settings ?? {}).quietHours ?? {}),
        },
        weeklySummary: {
          ...defaults.settings.weeklySummary,
          ...((n.settings ?? {}).weeklySummary ?? {}),
        },
      },
      items: Array.isArray(n.items) ? n.items : [],
      scheduled: Array.isArray(n.scheduled) ? n.scheduled : [],
    };
  }

  const parsed = AppDataSchema.safeParse(data);
  if (parsed.success) return parsed.data;
  return { ...seed, ...data, schemaVersion: CURRENT_SCHEMA_VERSION };
}
