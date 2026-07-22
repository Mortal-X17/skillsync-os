import { CURRENT_SCHEMA_VERSION, AppDataSchema, type AppData } from "./schema";
import { createInitialData } from "./seed";

/**
 * Run version-to-version migrations here. Never wipe user data.
 * Each entry migrates FROM its key TO key+1.
 */
const migrators: Record<number, (data: any) => any> = {
  // 0: (data) => ({ ...data, schemaVersion: 1 }),
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

  const parsed = AppDataSchema.safeParse(data);
  if (parsed.success) return parsed.data;
  // fall back but keep as much as possible
  return { ...seed, ...data, schemaVersion: CURRENT_SCHEMA_VERSION };
}
