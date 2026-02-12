import axios from "axios"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { QuizClient } from "./quiz"

export default async function QuizPage() {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get("access_token")

  const { data } = await axios.get("http://localhost:3001/quiz/attempt", {
    headers: {
      Cookie: `access_token=${accessToken?.value}`,
    },
  })

  if (data.attempt.length > 0) {
    redirect("/quiz/result")
  }

  return <QuizClient />
}
