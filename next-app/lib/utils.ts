import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import Cookies from "js-cookie"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getCSRFToken(): string | undefined {
  return Cookies.get("csrf_token")
}

export function addCSRFHeader(headers: Record<string, string> = {}): Record<string, string> {
  const token = getCSRFToken()
  if (token) {
    headers["X-CSRF-Token"] = token
  }
  return headers
}

export const PROTECTED_ROUTES = ["/dashboard", "/quiz", "/admin"]
export const API_URL = "http://localhost:3001"
