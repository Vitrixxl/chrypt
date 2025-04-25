CREATE TABLE "chrypt_account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chrypt_chat" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chrypt_message" (
	"pgTableid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"chat_id" uuid NOT NULL,
	"encrypted_content" text NOT NULL,
	"keys" jsonb DEFAULT '{}'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chrypt_session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "chrypt_session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "chrypt_user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean NOT NULL,
	"image" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "chrypt_user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "chrypt_user_chat" (
	"userId" text NOT NULL,
	"chatId" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chrypt_verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "chrypt_account" ADD CONSTRAINT "chrypt_account_user_id_chrypt_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."chrypt_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chrypt_message" ADD CONSTRAINT "chrypt_message_chat_id_chrypt_chat_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."chrypt_chat"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chrypt_session" ADD CONSTRAINT "chrypt_session_user_id_chrypt_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."chrypt_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chrypt_user_chat" ADD CONSTRAINT "chrypt_user_chat_userId_chrypt_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."chrypt_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chrypt_user_chat" ADD CONSTRAINT "chrypt_user_chat_chatId_chrypt_chat_id_fk" FOREIGN KEY ("chatId") REFERENCES "public"."chrypt_chat"("id") ON DELETE no action ON UPDATE no action;