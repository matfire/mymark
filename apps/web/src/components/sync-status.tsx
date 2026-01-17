import { Show, createMemo } from "solid-js";
import { FiCloud, FiCloudOff, FiUsers } from "solid-icons/fi";
import { authClient } from "../lib/auth-client";
import { usePresence } from "../hooks/use-presence";
import type { DocHandle } from "@automerge/automerge-repo/slim";
import type { Workspace } from "@mymark/common/repo";

interface SyncStatusProps {
  doc: DocHandle<Workspace>;
}

export const SyncStatus = ({ doc }: SyncStatusProps) => {
  const session = authClient.useSession();

  const isAuthenticated = () => !!session()?.data?.user;

  const { peerStates } = usePresence({
    handle: doc,
    initialState: {},
    userId: session().data?.user.id,
  });

  const peerCount = createMemo(() => peerStates().peers.length);

  return (
    <div class="fixed bottom-4 right-4 z-50">
      <div
        class={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
          isAuthenticated()
            ? "bg-success/10 text-success border border-success/20"
            : "bg-base-300/50 text-base-content/50 border border-base-content/10"
        }`}
      >
        <Show
          when={isAuthenticated()}
          fallback={
            <>
              <FiCloudOff size={14} />
              <span>Offline</span>
            </>
          }
        >
          <Show
            when={peerCount() > 0}
            fallback={
              <>
                <FiCloud size={14} />
                <span>Synced</span>
              </>
            }
          >
            <div class="relative">
              <FiCloud size={14} />
              <span class="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-success text-[8px] text-success-content">
                {peerCount()}
              </span>
            </div>
            <FiUsers size={12} />
            <span>{peerCount() === 1 ? "1 peer" : `${peerCount()} peers`}</span>
          </Show>
        </Show>
      </div>
    </div>
  );
};
