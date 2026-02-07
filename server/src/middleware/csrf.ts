import { Context, Next } from "hono"
import { getCookie } from "hono/cookie"
import { validateCSRFToken } from "../lib"

export async function csrfMiddleware(c: Context, next: Next) {
  const csrfCookie = getCookie(c, "csrf_token")
  const csrfHeader = c.req.header("X-CSRF-Token")

  if (!csrfCookie || !csrfHeader) {
    return c.json({ error: "CSRF token missing" }, 403)
  }

  if (!validateCSRFToken(csrfCookie, csrfHeader)) {
    return c.json({ error: "Invalid CSRF token" }, 403)
  }

  await next()
}
