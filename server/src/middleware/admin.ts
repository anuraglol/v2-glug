import { Context, Next } from "hono"
import { getCookie } from "hono/cookie"
import { verifyAccessToken } from "../lib/jwt"

export async function adminMiddleware(c: Context, next: Next) {
  const token = getCookie(c, "access_token")
  const payload = await verifyAccessToken(token!, c.env)

  if (!payload) {
    return c.json({ error: "Invalid token" }, 401)
  }

  c.set("user", payload)

  if (payload.role !== "admin") {
    return c.json({ error: "Forbidden: Admin access required" }, 403)
  }

  await next()
}
