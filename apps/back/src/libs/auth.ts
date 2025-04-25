import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import * as schema from "./db/schema";

export const auth = betterAuth({
	trustedOrigins: ["http://localhost:5173"],
	database: drizzleAdapter(db, {
		provider: "pg",
		schema,
	}),
	socialProviders: {
		google: {
			clientId: Bun.env.GOOGLE_CLIENT_ID as string,
			clientSecret: Bun.env.GOOGLE_CLIENT_SECRET as string,
		},
	},
});
