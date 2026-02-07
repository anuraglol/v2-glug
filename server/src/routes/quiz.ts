import { Hono } from "hono"
import { authMiddleware, getUser } from "../middleware/auth"
import { quizAttempts, quizQuestions } from "../lib/db/schema"
import { eq } from "drizzle-orm"
import { HonoParams } from "../lib/types"

const quiz = new Hono<HonoParams>()
quiz.use("*", authMiddleware)

quiz.get("/questions", async (c) => {
  const db = c.get("db")
  const questions = await db
    .select({
      id: quizQuestions.id,
      questionText: quizQuestions.questionText,
      options: quizQuestions.options,
    })
    .from(quizQuestions)
    .limit(10)

  if (questions.length === 0) {
    return c.json({ error: "No quiz questions found" }, 404)
  }

  return c.json({ questions })
})

quiz.get("/attempt", async (c) => {
  const user = getUser(c)
  const db = c.get("db")

  const attempt = await db
    .select({
      score: quizAttempts.score,
      submittedAt: quizAttempts.submittedAt,
    })
    .from(quizAttempts)
    .where(eq(quizAttempts.userId, user.userId))

  if (!attempt) {
    return c.json({ error: "No quiz attempt found" }, 404)
  }

  return c.json({ attempt })
})

quiz.post("/submit", async (c) => {
  const user = getUser(c)
  const { answers } = await c.req.json()
  const db = c.get("db")

  const questions = await db.select().from(quizQuestions).limit(10)
  let score = 0

  for (let i = 0; i < questions.length; i++) {
    if (answers[i] === questions[i].correctAnswer) {
      score++
    }
  }

  await db.insert(quizAttempts).values({
    userId: user.userId,
    score,
  })

  return c.json({ score })
})

export default quiz
