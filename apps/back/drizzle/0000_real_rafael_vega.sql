CREATE TABLE "shrymp_account" (
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
CREATE TABLE "shrymp_chat" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shrymp_message" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"chat_id" uuid NOT NULL,
	"encrypted_content" text NOT NULL,
	"keys" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shrymp_private_key" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text,
	"key" text NOT NULL,
	"iv" text NOT NULL,
	"salt" text NOT NULL,
	"version" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shrymp_session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "shrymp_session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "shrymp_user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean NOT NULL,
	"image" text,
	"public_key" text,
	"privateKeys" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "shrymp_user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "shrymp_user_chat" (
	"user_id" text NOT NULL,
	"chat_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shrymp_verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "shrymp_account" ADD CONSTRAINT "shrymp_account_user_id_shrymp_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."shrymp_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shrymp_message" ADD CONSTRAINT "shrymp_message_chat_id_shrymp_chat_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."shrymp_chat"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shrymp_private_key" ADD CONSTRAINT "shrymp_private_key_user_id_shrymp_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."shrymp_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shrymp_session" ADD CONSTRAINT "shrymp_session_user_id_shrymp_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."shrymp_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shrymp_user_chat" ADD CONSTRAINT "shrymp_user_chat_user_id_shrymp_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."shrymp_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shrymp_user_chat" ADD CONSTRAINT "shrymp_user_chat_chat_id_shrymp_chat_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."shrymp_chat"("id") ON DELETE no action ON UPDATE no action;