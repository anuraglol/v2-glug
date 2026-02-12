"use client"

import { useAuth } from "@/lib/hooks/auth"
import { Button } from "./ui/button"

export const Logout = () => {
  const { logout, isLoggingOut } = useAuth()

  return (
    <Button
      variant="outline"
      size="lg"
      onClick={() => {
        logout()
      }}
      disabled={isLoggingOut}
      className="absolute top-4 left-4"
    >
      {isLoggingOut ? "Logging out..." : "Logout"}
    </Button>
  )
}
