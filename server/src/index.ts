import { Hono } from "hono"
import quiz from "./routes/quiz"
import admin from "./routes/admin"
import { logger } from "hono/logger"
import { cors } from "hono/cors"
import { HonoParams } from "./lib/types"
import { dbMiddleware } from "./middleware/db"
import auth from "./routes/auth"

const app = new Hono<HonoParams>()

app.use("*", logger())
app.use("*", dbMiddleware)

const CORS_ORIGIN = "http://localhost:3000"

app.use(
  "*",
  cors({
    origin: CORS_ORIGIN,
    credentials: true,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "X-CSRF-Token"],
  }),
)

app.get("/", (c) => {
  return c.text("Hello Hono!")
})

app.route("/auth", auth)
app.route("/quiz", quiz)
app.route("/admin", admin)

export default app
