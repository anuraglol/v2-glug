import { useAuthStore } from "../store/auth"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"
import { jwtDecode } from "jwt-decode"
import { apiClient } from "../query"
import { addCSRFHeader } from "../utils"

import type { User } from "../store/auth"

interface JWTPayload {
  userId: string
  email: string
  role: "user" | "admin"
  exp: number
}

interface UseAuthReturn {
  user: User | null
  isAuthenticated: boolean
  logout: () => void
  isAdmin: boolean
  isLoggingOut: boolean
}

export function useAuth(): UseAuthReturn {
  const { user, setUser, logout: clearUser, isAuthenticated } = useAuthStore()
  const queryClient = useQueryClient()
  const router = useRouter()

  const checkAndRefreshToken = async () => {
    const token = Cookies.get("access_token")

    if (!token) {
      clearUser()
      return null
    }

    try {
      const decoded = jwtDecode<JWTPayload>(token)
      const now = Date.now() / 1000

      if (decoded.exp - now < 60) {
        await apiClient.post("/auth/refresh")
        const newToken = Cookies.get("access_token")
        if (newToken) {
          const newDecoded = jwtDecode<JWTPayload>(newToken)
          return {
            userId: newDecoded.userId,
            email: newDecoded.email,
            role: newDecoded.role,
          }
        }
      }

      return {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      }
    } catch {
      clearUser()
      return null
    }
  }

  const { data: userData } = useQuery({
    queryKey: ["auth"],
    queryFn: checkAndRefreshToken,
    refetchInterval: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  })

  if (userData && !user) {
    setUser(userData)
  }

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post("/auth/logout", {}, { headers: addCSRFHeader() })
    },
    onSuccess: () => {
      clearUser()
      queryClient.clear()
      router.push("/")
    },
  })

  const logout = () => {
    logoutMutation.mutate()
  }

  return {
    user,
    isAuthenticated,
    logout,
    isAdmin: user?.role === "admin",
    isLoggingOut: logoutMutation.isPending,
  }
}
