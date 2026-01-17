import { Repo } from "@automerge/automerge-repo";
import { BrowserWebSocketClientAdapter } from "@automerge/automerge-repo-network-websocket";
import { IndexedDBStorageAdapter } from "@automerge/automerge-repo-storage-indexeddb";

export const repo = new Repo({
  storage: new IndexedDBStorageAdapter(),
  network: [
    new BrowserWebSocketClientAdapter(
      import.meta.env.PROD
        ? `${import.meta.env.VITE_API_URL.replace("http", "ws")}/automerge`
        : `ws://localhost:3000/automerge`,
    ),
  ],
});
