import { Hono } from "hono"
import { adminMiddleware } from "../middleware/admin"
import { quizAttempts, quizQuestions } from "../lib/db/schema"
import { HonoParams } from "../lib/types"

const admin = new Hono<HonoParams>()
admin.use("*", adminMiddleware)

admin.get("/attempts", async (c) => {
  const db = c.get("db")

  const attempts = await db
    .select({
      userId: quizAttempts.userId,
      score: quizAttempts.score,
      submittedAt: quizAttempts.submittedAt,
    })
    .from(quizAttempts)

  if (attempts.length === 0) {
    return c.json({ error: "No quiz attempts found" }, 404)
  }

  return c.json({ attempts })
})

admin.post("/questions", async (c) => {
  const { questionText, options, correctAnswer } = await c.req.json()
  const db = c.get("db")

  if (!questionText || !options || correctAnswer === undefined) {
    return c.json({ error: "Missing required fields" }, 400)
  }

  const newQuestion = await db.insert(quizQuestions).values({
    questionText,
    options,
    correctAnswer,
  })

  return c.json({ question: newQuestion })
})

export default admin
