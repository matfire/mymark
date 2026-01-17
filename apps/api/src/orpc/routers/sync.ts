import { db } from "@mymark/db";
import { userDocumentRoot } from "@mymark/db/schema";
import { ORPCError } from "@orpc/server";
import { eq } from "drizzle-orm";
import { os } from "../implement";

const storeDocumentUrl = os.sync.storeDocumentUrl.handler(
	async ({ context, input }) => {
		const existingUserDocument = await db
			.select()
			.from(userDocumentRoot)
			.where(eq(userDocumentRoot.userId, context.user.id));
		if (existingUserDocument.length > 1) {
			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: "user already has a document",
			});
		}

		await db.insert(userDocumentRoot).values({
			userId: context.user.id,
			rootUrl: input.docUrl,
		});
	},
);

const getDocumentUrl = os.sync.getDocumentUrl.handler(async ({ context }) => {
	const existingUserDocument = (
		await db
			.select()
			.from(userDocumentRoot)
			.where(eq(userDocumentRoot.userId, context.user.id))
	).at(0);

	return { documentUrl: existingUserDocument?.rootUrl };
});

export { storeDocumentUrl, getDocumentUrl };
