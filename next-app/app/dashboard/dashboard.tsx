"use client"
import { Button } from "@/components/ui/button"
import { useQuiz } from "@/lib/hooks/quiz"
import { useRouter } from "next/navigation"

export const Dashboard = () => {
  const router = useRouter()
  const { attempt, attemptLoading } = useQuiz()

  return (
    <div>
      {attemptLoading ? (
        <p>Loading your quiz attempt...</p>
      ) : attempt ? (
        <Button variant="outline" className="w-64" onClick={() => router.push("/quiz/result")}>
          View Results
        </Button>
      ) : (
        <Button variant="outline" size="lg" onClick={() => router.push("/quiz")} className="w-64">
          Take a Quiz
        </Button>
      )}
    </div>
  )
}
