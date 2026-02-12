import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { addCSRFHeader } from "../utils"
import { apiClient } from "../query"

interface Question {
  id: string
  questionText: string
  options: string[]
}

export interface QuizAttempt {
  id: string
  userId: string
  score: number
  submittedAt: string
}

export function useQuiz() {
  const queryClient = useQueryClient()

  const { data: questions, isLoading: questionsLoading } = useQuery({
    queryKey: ["quiz-questions"],
    queryFn: async () => {
      const { data } = await apiClient.get("/quiz/questions")
      return data.questions as Question[]
    },
  })

  const { data: attempt, isLoading: attemptLoading } = useQuery({
    queryKey: ["quiz-attempt"],
    queryFn: async () => {
      const { data } = await apiClient.get("/quiz/attempt")
      console.log("Quiz attempt data:", data)
      return data.attempt[0] as QuizAttempt | null
    },
  })

  const submitMutation = useMutation({
    mutationFn: async (answers: number[]) => {
      const { data } = await apiClient.post(
        "/quiz/submit",
        { answers },
        { headers: addCSRFHeader() },
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quiz-attempt"] })
    },
  })

  return {
    questions,
    questionsLoading,
    attempt,
    attemptLoading,
    submitQuiz: submitMutation.mutate,
    isSubmitting: submitMutation.isPending,
  }
}
