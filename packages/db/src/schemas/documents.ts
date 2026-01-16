import {
	customType,
	index,
	pgTable,
	text,
	timestamp,
	unique,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

const bytea = customType<{
	data: Buffer;
	default: false;
}>({
	dataType() {
		return "bytea";
	},
});

export const automergeStorage = pgTable(
	"automerge_storage",
	{
		id: text()
			.primaryKey()
			.$default(() => crypto.randomUUID()),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		key: bytea("key").array().notNull(), // Storage key (e.g., "docId/incremental/hash")
		data: bytea("data").notNull(), // Binary chunk data
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		index("automerge_storage_user_idx").on(table.userId),
		unique("automerge_storage_user_key_unique").on(table.userId, table.key),
	],
);

export const userDocumentRoot = pgTable("user_document_root", {
	userId: text("user_id")
		.primaryKey()
		.references(() => user.id, { onDelete: "cascade" }),
	rootUrl: text("root_url").notNull(), // AutomergeUrl of user's workspace
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
});
