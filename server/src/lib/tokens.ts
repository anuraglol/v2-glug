import { randomBytes } from "crypto"
import { db } from "./db"
import { refreshTokens } from "./db/schema"
import { eq, and, gt } from "drizzle-orm"

const REFRESH_TOKEN_EXPIRY_DAYS = 7

export function generateRefreshToken(): string {
  return randomBytes(32).toString("hex")
}

export async function storeRefreshToken(userId: string, token: string) {
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS)

  await db.insert(refreshTokens).values({
    userId,
    token,
    expiresAt,
  })
}

export async function validateRefreshToken(token: string) {
  const [result] = await db
    .select()
    .from(refreshTokens)
    .where(and(eq(refreshTokens.token, token), gt(refreshTokens.expiresAt, new Date())))
    .limit(1)

  return result || null
}

export async function deleteRefreshToken(token: string) {
  await db.delete(refreshTokens).where(eq(refreshTokens.token, token))
}

export async function deleteAllUserRefreshTokens(userId: string) {
  await db.delete(refreshTokens).where(eq(refreshTokens.userId, userId))
}

export async function rotateRefreshToken(oldToken: string, userId: string): Promise<string> {
  await deleteRefreshToken(oldToken)
  const newToken = generateRefreshToken()
  await storeRefreshToken(userId, newToken)
  return newToken
}
