import type {
	Chunk,
	StorageAdapterInterface,
	StorageKey,
} from "@automerge/automerge-repo";
import { db } from "@mymark/db";
import { automergeStorage } from "@mymark/db/schema";
import { and, eq, gte, lt } from "drizzle-orm/pg-core/expressions";

//heavily inspired by https://github.com/max-dekock/automerge-repo-storage-postgres/blob/main/src/index.ts

export function keyToArray(key: StorageKey): Buffer[] {
	return key.map((k) => Buffer.from(k, "utf8"));
}

export function arrayToKey(array: Buffer[]): StorageKey {
	return array.map((a) => a.toString("utf8"));
}

export function keyPrefixRange(keyPrefix: StorageKey): [Buffer[], Buffer[]] {
	const lowerBound = keyToArray(keyPrefix);

	const upperBound = lowerBound.map((buf) => Buffer.from(buf));

	upperBound[upperBound.length - 1] = Buffer.concat([
		upperBound[upperBound.length - 1]!,
	]);

	return [lowerBound, upperBound];
}

export class PostgresStorageAdapter implements StorageAdapterInterface {
	constructor(private userId: string) {}

	async load(key: StorageKey): Promise<Uint8Array | undefined> {
		const keyArray = keyToArray(key);
		const result = await db.query.automergeStorage.findFirst({
			where: and(
				eq(automergeStorage.userId, this.userId),
				eq(automergeStorage.key, keyArray),
			),
		});
		if (!result) return undefined;
		return Uint8Array.from(result.data);
	}
	async save(key: StorageKey, data: Uint8Array): Promise<void> {
		const keyArray = keyToArray(key);
		await db
			.insert(automergeStorage)
			.values({
				userId: this.userId,
				key: keyArray,
				data: Buffer.from(data),
			})
			.onConflictDoUpdate({
				target: [automergeStorage.userId, automergeStorage.key],
				set: { data: Buffer.from(data), updatedAt: new Date() },
			});
	}
	async remove(key: StorageKey): Promise<void> {
		const keyArray = keyToArray(key);
		await db
			.delete(automergeStorage)
			.where(
				and(
					eq(automergeStorage.userId, this.userId),
					eq(automergeStorage.key, keyArray),
				),
			);
	}
	async loadRange(keyPrefix: StorageKey): Promise<Chunk[]> {
		const [lowerBound, upperBound] = keyPrefixRange(keyPrefix);
		const results = await db.query.automergeStorage.findMany({
			where: and(
				eq(automergeStorage.userId, this.userId),
				gte(automergeStorage.key, lowerBound),
				lt(automergeStorage.key, upperBound),
			),
		});
		return results.map((row) => ({
			key: arrayToKey(row.key),
			data: Uint8Array.from(row.data),
		}));
	}
	async removeRange(keyPrefix: StorageKey): Promise<void> {
		const [lowerBound, upperBound] = keyPrefixRange(keyPrefix);
		await db
			.delete(automergeStorage)
			.where(
				and(
					eq(automergeStorage.userId, this.userId),
					gte(automergeStorage.key, lowerBound),
					lt(automergeStorage.key, upperBound),
				),
			);
	}
}
