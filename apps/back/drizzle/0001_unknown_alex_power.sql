ALTER TABLE "shrymp_message" ADD COLUMN "iv" text NOT NULL;--> statement-breakpoint
ALTER TABLE "shrymp_user" DROP COLUMN "privateKeys";