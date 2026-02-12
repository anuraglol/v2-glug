import { getServerUser } from "@/lib/auth-server"
import { redirect } from "next/navigation"
import { ResultClient } from "./result"

export default async function ResultPage() {
  const user = await getServerUser()

  if (!user) {
    redirect("/")
  }

  return <ResultClient />
}
