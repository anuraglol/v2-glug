import { createMiddleware } from "hono/factory"
import { createDb, type DB } from "../lib/db"
import { EnvBindings } from "../lib/types"

type Variables = {
  db: DB
}

export const dbMiddleware = createMiddleware<{
  Bindings: EnvBindings
  Variables: Variables
}>(async (c, next) => {
  const db = createDb(c.env)
  c.set("db", db)
  await next()
})
