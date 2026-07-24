import { CURRENT_SCHEMA_VERSION, AppDataSchema, type AppData } from "./schema";
import { createInitialData } from "./seed";
import { todayISO } from "./date";

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
    ...(data.preferences ?? {}),
    modules: {
      attendance: false,
      expenses: false,
      ...((data.preferences ?? {}).modules ?? {}),
    },
  };
  data.attendance = data.attendance ?? { subjects: [] };
  data.expenses = data.expenses ?? { transactions: [] };

  const parsed = AppDataSchema.safeParse(data);
  if (parsed.success) return parsed.data;
  return { ...seed, ...data, schemaVersion: CURRENT_SCHEMA_VERSION };
}
