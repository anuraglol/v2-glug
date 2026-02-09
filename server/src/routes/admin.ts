import { Hono } from "hono"
import { adminMiddleware } from "../middleware/admin"
import { quizAttempts, quizQuestions, users } from "../lib/db/schema"
import { HonoParams } from "../lib/types"
import { eq } from "drizzle-orm"

const admin = new Hono<HonoParams>()
admin.use("*", adminMiddleware)

admin.get("/questions", async (c) => {
  const db = c.get("db")
  const questions = await db.select().from(quizQuestions)

  return c.json({ questions })
})

admin.get("/attempts", async (c) => {
  const db = c.get("db")

  const attempts = await db
    .select({
      id: quizAttempts.id,
      userId: quizAttempts.userId,
      email: users.email,
      score: quizAttempts.score,
      submittedAt: quizAttempts.submittedAt,
    })
    .from(quizAttempts)
    .leftJoin(users, eq(quizAttempts.userId, users.id))

  console.log("Fetched attempts:", attempts)

  return c.json({ attempts })
})

admin.post("/questions", async (c) => {
  const { questionText, options, correctAnswer } = await c.req.json()
  const db = c.get("db")

  if (!questionText || !options || correctAnswer === undefined) {
    return c.json({ error: "Missing required fields" }, 400)
  }

  const [newQuestion] = await db
    .insert(quizQuestions)
    .values({
      questionText,
      options,
      correctAnswer,
    })
    .returning()

  return c.json({ question: newQuestion })
})

admin.delete("/questions/:id", async (c) => {
  const id = c.req.param("id")
  const db = c.get("db")

  try {
    await db.delete(quizQuestions).where(eq(quizQuestions.id, id))
    return c.json({ success: true })
  } catch (error) {
    console.error("Error deleting question:", error)
    return c.json({ error: "Failed to delete question" }, 500)
  }
})

export default admin
