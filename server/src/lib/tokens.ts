import { refreshTokens } from "./db/schema"
import { eq, and, gt } from "drizzle-orm"
import { DB } from "./db"

const REFRESH_TOKEN_EXPIRY_DAYS = 7

export function generateRefreshToken(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")
}

export async function storeRefreshToken(userId: string, token: string, db: DB) {
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS)

  await db.insert(refreshTokens).values({
    userId,
    token,
    expiresAt,
  })
}

export async function validateRefreshToken(token: string, db: DB) {
  const [result] = await db
    .select()
    .from(refreshTokens)
    .where(and(eq(refreshTokens.token, token), gt(refreshTokens.expiresAt, new Date())))
    .limit(1)

  return result || null
}

export async function deleteRefreshToken(token: string, db: DB) {
  await db.delete(refreshTokens).where(eq(refreshTokens.token, token))
}

export async function deleteAllUserRefreshTokens(userId: string, db: DB) {
  await db.delete(refreshTokens).where(eq(refreshTokens.userId, userId))
}

export async function rotateRefreshToken(
  oldToken: string,
  userId: string,
  db: DB,
): Promise<string> {
  await deleteRefreshToken(oldToken, db)
  const newToken = generateRefreshToken()
  await storeRefreshToken(userId, newToken, db)
  return newToken
}
