import { getServerUser } from "@/lib/auth-server"
import { redirect } from "next/navigation"
import { Admin } from "@/app/dashboard/admin"

export default async function Page() {
  const user = await getServerUser()

  if (!user) {
    redirect("/")
  }

  if (user.role !== "admin") {
    redirect("/dashboard")
  }

  return <Admin />
}
