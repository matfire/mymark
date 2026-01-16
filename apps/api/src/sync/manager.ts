import { type PeerId, Repo } from "@automerge/automerge-repo";
import type { WSContext } from "hono/ws";
import { WebsocketAutomergeAdapter } from "./network";
import { PostgresStorageAdapter } from "./storage";

interface UserRepoEntry {
	repo: Repo;
	adapters: Set<WebsocketAutomergeAdapter>;
}

class RepoManager {
	private userRepos = new Map<string, UserRepoEntry>();

	getOrCreateRepo(userId: string): UserRepoEntry {
		let entry = this.userRepos.get(userId);
		if (!entry) {
			const storage = new PostgresStorageAdapter(userId);
			const repo = new Repo({
				storage,
				network: [],
				peerId: `server-${userId}` as PeerId,
			});
			entry = { repo, adapters: new Set() };
			this.userRepos.set(userId, entry);
		}
		return entry;
	}

	addConnection(userId: string, ws: WSContext): WebsocketAutomergeAdapter {
		const { repo, adapters } = this.getOrCreateRepo(userId);
		const adapter = new WebsocketAutomergeAdapter(ws);

		// Connect adapter to repo
		adapter.connect(`server-${userId}` as PeerId);
		repo.networkSubsystem.addNetworkAdapter(adapter);
		adapters.add(adapter);

		return adapter;
	}

	removeConnection(userId: string, adapter: WebsocketAutomergeAdapter) {
		const entry = this.userRepos.get(userId);
		if (entry) {
			entry.adapters.delete(adapter);
			adapter.disconnect();

			// Optionally cleanup repo if no connections
			if (entry.adapters.size === 0) {
				// Keep repo alive for a while for reconnections
				// or cleanup immediately if memory is a concern
			}
		}
	}
}

export const repoManager = new RepoManager();
