import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { addCSRFHeader } from "../utils"
import { apiClient } from "../query"

interface Question {
  id: string
  questionText: string
  options: string[]
  correctAnswer: number
  createdAt: string
}

interface Attempt {
  id: string
  email: string
  score: number
  submittedAt: string
}

interface NewQuestion {
  questionText: string
  options: string[]
  correctAnswer: number
}

export function useAdmin() {
  const queryClient = useQueryClient()

  const { data: questions, isLoading: questionsLoading } = useQuery({
    queryKey: ["admin-questions"],
    queryFn: async () => {
      const { data } = await apiClient.get("/admin/questions")
      return data.questions as Question[]
    },
  })

  const { data: attempts, isLoading: attemptsLoading } = useQuery({
    queryKey: ["admin-attempts"],
    queryFn: async () => {
      const { data } = await apiClient.get("/admin/attempts")
      return data.attempts as Attempt[]
    },
  })

  const addQuestionMutation = useMutation({
    mutationFn: async (question: NewQuestion) => {
      const { data } = await apiClient.post("/admin/questions", question, {
        headers: addCSRFHeader(),
      })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-questions"] })
    },
  })

  const deleteQuestionMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/admin/questions/${id}`, { headers: addCSRFHeader() })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-questions"] })
    },
  })

  return {
    questions,
    questionsLoading,
    attempts,
    attemptsLoading,
    addQuestion: addQuestionMutation.mutate,
    deleteQuestion: deleteQuestionMutation.mutate,
    isAddingQuestion: addQuestionMutation.isPending,
    isDeletingQuestion: deleteQuestionMutation.isPending,
  }
}
