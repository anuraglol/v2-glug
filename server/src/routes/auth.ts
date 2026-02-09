import { Hono } from "hono"
import { setCookie, getCookie, deleteCookie } from "hono/cookie"
import { users } from "../lib/db/schema"
import { eq } from "drizzle-orm"
import {
  getGoogleOAuthURL,
  exchangeCodeForTokens,
  getGoogleUserInfo,
  type GoogleOAuthConfig,
  type GoogleUserInfo,
} from "../lib/auth"
import { generateAccessToken, type JWTPayload } from "../lib/jwt"
import {
  generateRefreshToken,
  storeRefreshToken,
  validateRefreshToken,
  deleteRefreshToken,
  rotateRefreshToken,
} from "../lib/tokens"
import { generateCSRFToken } from "../lib"
import { HonoParams } from "../lib/types"

const auth = new Hono<HonoParams>()

const stateStore = new Map<string, number>()

auth.get("/google", (c) => {
  const state = generateCSRFToken()
  stateStore.set(state, Date.now())

  setTimeout(() => stateStore.delete(state), 5 * 60 * 1000)

  const oauthConfig: GoogleOAuthConfig = {
    clientId: c.env.GOOGLE_CLIENT_ID,
    clientSecret: c.env.GOOGLE_CLIENT_SECRET,
    redirectUri: c.env.GOOGLE_REDIRECT_URI,
  }

  const url = getGoogleOAuthURL(state, oauthConfig)
  return c.redirect(url)
})

auth.get("/google/callback", async (c) => {
  const code = c.req.query("code")
  const state = c.req.query("state")
  const db = c.get("db")
  const secure = c.env.NODE_ENV === "production"

  if (!code || !state) {
    return c.json({ error: "Missing code or state" }, 400)
  }

  if (!stateStore.has(state)) {
    return c.json({ error: "Invalid state" }, 400)
  }

  stateStore.delete(state)

  try {
    const oauthConfig: GoogleOAuthConfig = {
      clientId: c.env.GOOGLE_CLIENT_ID,
      clientSecret: c.env.GOOGLE_CLIENT_SECRET,
      redirectUri: c.env.GOOGLE_REDIRECT_URI,
    }

    const tokens = await exchangeCodeForTokens(code, oauthConfig)
    const userInfo: GoogleUserInfo = await getGoogleUserInfo(tokens.access_token)

    if (!userInfo.verified_email) {
      return c.json({ error: "Email not verified" }, 400)
    }

    let [user] = await db.select().from(users).where(eq(users.googleId, userInfo.id)).limit(1)

    if (!user) {
      ;[user] = await db
        .insert(users)
        .values({
          email: userInfo.email,
          googleId: userInfo.id,
          role: "user",
        })
        .returning()
    }

    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    }

    const accessToken = await generateAccessToken(payload, c.env)
    const refreshToken = generateRefreshToken()
    const csrfToken = generateCSRFToken()

    await storeRefreshToken(user.id, refreshToken, db)

    setCookie(c, "access_token", accessToken, {
      httpOnly: false,
      secure,
      sameSite: "Lax",
      maxAge: 15 * 60,
      path: "/",
      domain: "localhost",
    })

    setCookie(c, "refresh_token", refreshToken, {
      httpOnly: true,
      secure,
      sameSite: "Lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
      domain: "localhost",
    })

    setCookie(c, "csrf_token", csrfToken, {
      httpOnly: false,
      secure,
      sameSite: "Lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
      domain: "localhost",
    })

    return c.redirect(`${c.env.FRONTEND_URL}/dashboard`)
  } catch (error) {
    console.error("OAuth callback error:", error)
    return c.json({ error: "Authentication failed" }, 500)
  }
})

auth.post("/refresh", async (c) => {
  const refreshToken = getCookie(c, "refresh_token")
  const db = c.get("db")
  const secure = c.env.NODE_ENV === "production"

  if (!refreshToken) {
    return c.json({ error: "No refresh token" }, 401)
  }

  const tokenData = await validateRefreshToken(refreshToken, db)

  if (!tokenData) {
    return c.json({ error: "Invalid refresh token" }, 401)
  }

  const [user] = await db.select().from(users).where(eq(users.id, tokenData.userId)).limit(1)

  if (!user) {
    return c.json({ error: "User not found" }, 401)
  }

  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  }

  const newAccessToken = await generateAccessToken(payload, c.env)
  const newRefreshToken = await rotateRefreshToken(refreshToken, user.id, db)

  setCookie(c, "access_token", newAccessToken, {
    httpOnly: false,
    secure,
    sameSite: "Lax",
    domain: "localhost",
    maxAge: 15 * 60,
    path: "/",
  })

  setCookie(c, "refresh_token", newRefreshToken, {
    httpOnly: true,
    secure,
    sameSite: "Lax",
    domain: "localhost",
    maxAge: 7 * 24 * 60 * 60,
    path: "/",
  })

  return c.json({ success: true })
})

auth.post("/logout", async (c) => {
  const refreshToken = getCookie(c, "refresh_token")
  const db = c.get("db")

  if (refreshToken) {
    await deleteRefreshToken(refreshToken, db)
  }

  deleteCookie(c, "access_token")
  deleteCookie(c, "refresh_token")
  deleteCookie(c, "csrf_token")

  return c.json({ success: true })
})

export default auth
