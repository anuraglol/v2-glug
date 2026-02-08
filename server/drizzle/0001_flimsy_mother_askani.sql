ALTER TABLE "quiz_attempts" DROP CONSTRAINT "quiz_attempts_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_user_id_users_google_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("google_id") ON DELETE cascade ON UPDATE no action;