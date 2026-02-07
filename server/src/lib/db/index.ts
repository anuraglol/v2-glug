import { drizzle } from "drizzle-orm/neon-http"
import { neon } from "@neondatabase/serverless"
import * as schema from "./schema"
import type { EnvBindings } from "../types"

export function createDb(env: EnvBindings) {
  const sql = neon(env.DATABASE_URL)
  return drizzle(sql, { schema })
}

export type DB = ReturnType<typeof createDb>
