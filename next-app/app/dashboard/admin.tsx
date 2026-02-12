"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useAdmin } from "@/lib/hooks/admin"
import { Trash2, Plus, List, Users } from "lucide-react"

type Tab = "questions" | "add" | "attempts"

export function Admin() {
  const [activeTab, setActiveTab] = useState<Tab>("questions")
  const {
    questions,
    questionsLoading,
    attempts,
    attemptsLoading,
    addQuestion,
    deleteQuestion,
    isAddingQuestion,
    isDeletingQuestion,
  } = useAdmin()

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === "questions" ? "default" : "outline"}
            onClick={() => setActiveTab("questions")}
          >
            <List className="size-4 mr-2" />
            Questions
          </Button>
          <Button
            variant={activeTab === "add" ? "default" : "outline"}
            onClick={() => setActiveTab("add")}
          >
            <Plus className="size-4 mr-2" />
            Add Question
          </Button>
          <Button
            variant={activeTab === "attempts" ? "default" : "outline"}
            onClick={() => setActiveTab("attempts")}
          >
            <Users className="size-4 mr-2" />
            Attempts
          </Button>
        </div>

        {activeTab === "questions" && (
          <QuestionsSection
            questions={questions}
            isLoading={questionsLoading}
            onDelete={deleteQuestion}
            isDeleting={isDeletingQuestion}
          />
        )}

        {activeTab === "add" && (
          <AddQuestionSection
            onAdd={addQuestion}
            isAdding={isAddingQuestion}
            onSuccess={() => setActiveTab("questions")}
          />
        )}

        {activeTab === "attempts" && (
          <AttemptsSection attempts={attempts} isLoading={attemptsLoading} />
        )}
      </div>
    </div>
  )
}

interface Question {
  id: string
  questionText: string
  options: string[]
  correctAnswer: number
  createdAt: string
}

interface QuestionsSectionProps {
  questions: Question[] | undefined
  isLoading: boolean
  onDelete: (id: string) => void
  isDeleting: boolean
}

function QuestionsSection({ questions, isLoading, onDelete, isDeleting }: QuestionsSectionProps) {
  if (isLoading) {
    return <p className="text-muted-foreground">Loading questions...</p>
  }

  if (!questions || questions.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">
            No questions found. Add some questions to get started.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4">
      <p className="text-sm text-muted-foreground">{questions.length} question(s) total</p>
      {questions.map((question, idx) => (
        <Card key={question.id}>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <CardTitle className="text-base">
                  {idx + 1}. {question.questionText}
                </CardTitle>
                <CardDescription>
                  Correct answer: Option {String.fromCharCode(65 + question.correctAnswer)}
                </CardDescription>
              </div>
              <Button
                variant="destructive"
                size="icon-sm"
                onClick={() => onDelete(question.id)}
                disabled={isDeleting}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-1">
              {question.options.map((option, optIdx) => (
                <div
                  key={optIdx}
                  className={`text-sm px-2 py-1 rounded ${
                    optIdx === question.correctAnswer
                      ? "bg-green-500/10 text-green-500"
                      : "text-muted-foreground"
                  }`}
                >
                  {String.fromCharCode(65 + optIdx)}. {option}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

type NewQuestion = { questionText: string; options: string[]; correctAnswer: number }

interface AddQuestionSectionProps {
  onAdd: (
    question: NewQuestion,
    options?: { onSuccess?: () => void; onError?: (err: any) => void },
  ) => void
  isAdding: boolean
  onSuccess: () => void
}

function AddQuestionSection({ onAdd, isAdding, onSuccess }: AddQuestionSectionProps) {
  const [questionText, setQuestionText] = useState("")
  const [options, setOptions] = useState(["", "", "", ""])
  const [correctAnswer, setCorrectAnswer] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!questionText.trim()) {
      setError("Question text is required")
      return
    }

    const filledOptions = options.filter((opt) => opt.trim())
    if (filledOptions.length < 2) {
      setError("At least 2 options are required")
      return
    }

    if (correctAnswer >= filledOptions.length) {
      setError("Correct answer index is out of range")
      return
    }

    onAdd(
      { questionText: questionText.trim(), options: filledOptions, correctAnswer },
      {
        onSuccess: () => {
          setQuestionText("")
          setOptions(["", "", "", ""])
          setCorrectAnswer(0)
          onSuccess()
        },
        onError: (err: any) => {
          setError(err?.response?.data?.error || "Failed to add question")
        },
      },
    )
  }

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Question</CardTitle>
        <CardDescription>Create a new quiz question with multiple choice options</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <label htmlFor="question" className="text-sm font-medium">
              Question Text
            </label>
            <Textarea
              id="question"
              placeholder="Enter your question..."
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Options</label>
            {options.map((option, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground w-6">
                  {String.fromCharCode(65 + idx)}.
                </span>
                <Input
                  placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                  value={option}
                  onChange={(e) => updateOption(idx, e.target.value)}
                />
                <input
                  type="radio"
                  name="correctAnswer"
                  checked={correctAnswer === idx}
                  onChange={() => setCorrectAnswer(idx)}
                  className="size-4"
                  title={`Mark option ${String.fromCharCode(65 + idx)} as correct`}
                />
              </div>
            ))}
            <p className="text-xs text-muted-foreground">
              Select the radio button next to the correct answer
            </p>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button type="submit" disabled={isAdding}>
            {isAdding ? "Adding..." : "Add Question"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

interface Attempt {
  id: string
  email: string | null
  score: number
  submittedAt: string
}

interface AttemptsSectionProps {
  attempts: Attempt[] | undefined
  isLoading: boolean
}

function AttemptsSection({ attempts, isLoading }: AttemptsSectionProps) {
  if (isLoading) {
    return <p className="text-muted-foreground">Loading attempts...</p>
  }

  if (!attempts || attempts.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">No quiz attempts yet.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4">
      <p className="text-sm text-muted-foreground">{attempts.length} attempt(s) total</p>
      <Card>
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3 text-sm font-medium">User</th>
                <th className="text-left p-3 text-sm font-medium">Score</th>
                <th className="text-left p-3 text-sm font-medium">Submitted At</th>
              </tr>
            </thead>
            <tbody>
              {attempts.map((attempt) => (
                <tr key={attempt.id} className="border-b last:border-0">
                  <td className="p-3 text-sm">{attempt.email || "Unknown"}</td>
                  <td className="p-3 text-sm">{attempt.score}</td>
                  <td className="p-3 text-sm text-muted-foreground">
                    {new Date(attempt.submittedAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
