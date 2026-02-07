import { Context, Next } from "hono"
import { getUser } from "./auth"

export async function adminMiddleware(c: Context, next: Next) {
  const user = getUser(c)

  if (user.role !== "admin") {
    return c.json({ error: "Forbidden: Admin access required" }, 403)
  }

  await next()
}
