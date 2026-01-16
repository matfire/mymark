import { Repo } from "@automerge/automerge-repo";
import { BroadcastChannelNetworkAdapter } from "@automerge/automerge-repo-network-broadcastchannel";
import { BrowserWebSocketClientAdapter } from "@automerge/automerge-repo-network-websocket";
import { IndexedDBStorageAdapter } from "@automerge/automerge-repo-storage-indexeddb";

export const repo = new Repo({
  storage: new IndexedDBStorageAdapter(),
  network: [
    new BroadcastChannelNetworkAdapter(),
    new BrowserWebSocketClientAdapter(
      import.meta.env.PROD
        ? `wss://${import.meta.env.VITE_API_URL}/automerge`
        : `ws://localhost:3000/automerge`,
    ),
  ],
});
