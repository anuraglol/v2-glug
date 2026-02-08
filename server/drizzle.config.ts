import type { Config } from "drizzle-kit"
import dotenv from "dotenv"

dotenv.config()

export default {
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: "postgresql://neondb_owner:npg_aXlfyi5udKW0@ep-young-snow-a137hd0m-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
  },
} satisfies Config
