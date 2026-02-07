import { Context, Next } from "hono"
import { getCookie } from "hono/cookie"
import { verifyAccessToken, type JWTClaims } from "../lib/jwt"

export async function authMiddleware(c: Context, next: Next) {
  const token = getCookie(c, "access_token")

  if (!token) {
    return c.json({ error: "Unauthorized" }, 401)
  }

  const payload = verifyAccessToken(token, c.env)

  if (!payload) {
    return c.json({ error: "Invalid token" }, 401)
  }

  c.set("user", payload)
  await next()
}

export function getUser(c: Context): JWTClaims {
  return c.get("user")
}
