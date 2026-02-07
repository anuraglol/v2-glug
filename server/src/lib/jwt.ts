import { SignJWT, jwtVerify, type JWTPayload as JoseJWTPayload } from "jose"
import { EnvBindings } from "./types"

const ACCESS_TOKEN_EXPIRY = "15m"

export interface JWTClaims extends JoseJWTPayload {
  userId: string
  email: string
  role: "user" | "admin"
}
export interface JWTPayload extends JWTClaims {}

const genSecret = (jwtSecret: string) => new TextEncoder().encode(jwtSecret)

export async function generateAccessToken(payload: JWTClaims, env: EnvBindings) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(ACCESS_TOKEN_EXPIRY)
    .setIssuedAt()
    .sign(genSecret(env.JWT_SECRET))
}

export async function verifyAccessToken(
  token: string,
  env: EnvBindings,
): Promise<JWTClaims | null> {
  try {
    const { payload } = await jwtVerify(token, genSecret(env.JWT_SECRET))
    return payload as JWTClaims
  } catch {
    return null
  }
}
