import { cookies } from "next/headers"
import { jwtDecode } from "jwt-decode"

interface JWTPayload {
  userId: string
  email: string
  role: "user" | "admin"
  exp: number
  googleId: string
}

export interface User {
  userId: string
  email: string
  role: "user" | "admin"
}

export async function getServerUser(): Promise<User | null> {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get("access_token")

  if (!accessToken) {
    return null
  }

  try {
    const decoded = jwtDecode<JWTPayload>(accessToken.value)

    const now = Math.floor(Date.now() / 1000)
    if (decoded.exp < now) {
      console.log("Access token expired")
      return null
    }

    return {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    }
  } catch {
    return null
  }
}

export async function requireAuth(): Promise<User> {
  const user = await getServerUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  return user
}

export async function requireAdmin(): Promise<User> {
  const user = await requireAuth()

  if (user.role !== "admin") {
    throw new Error("Forbidden: Admin access required")
  }

  return user
}
