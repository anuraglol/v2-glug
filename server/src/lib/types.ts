import { DB } from "./db"
import { User } from "./db/schema"

export type EnvBindings = {
  DATABASE_URL: string
  JWT_SECRET: string
  GOOGLE_CLIENT_ID: string
  GOOGLE_CLIENT_SECRET: string
  GOOGLE_REDIRECT_URI: string
  FRONTEND_URL: string
  NODE_ENV: string
  PORT: string
}

export type HonoParams = {
  Bindings: EnvBindings
  Variables: {
    db: DB
    user: User
  }
}
