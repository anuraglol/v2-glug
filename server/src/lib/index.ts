import { randomBytes } from "crypto"

export function generateCSRFToken(): string {
  return randomBytes(32).toString("hex")
}

export function validateCSRFToken(token: string, headerToken: string): boolean {
  return token === headerToken
}
