import Elysia from "elysia";
import { db } from "../libs/db";
import * as schema from "../libs/db/schema";

export const database = new Elysia()
	.decorate("db", db)
	.decorate("schema", schema);
