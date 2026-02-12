import { getServerUser } from "@/lib/auth-server"
import { Admin } from "./admin"
import { Dashboard } from "./dashboard"
import { Logout } from "@/components/logout"

export default async function Page() {
  const user = await getServerUser()
  const isAdmin = user?.role === "admin"

  return (
    <div className="flex w-full justify-center items-center flex-col gap-4 min-h-screen">
      <p className="text-foreground/90 mb-2">
        Hello {user?.userId.slice(0, 5) + "..." + user?.userId.slice(-4)}. You have the role of{" "}
        <span className="text-purple-500">{user?.role}</span>. Welcome to your dashboard!
      </p>

      <Logout />
      {isAdmin ? <Admin /> : <Dashboard />}
    </div>
  )
}
