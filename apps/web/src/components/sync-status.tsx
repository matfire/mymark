import { Show } from "solid-js";
import { FiCloud, FiCloudOff } from "solid-icons/fi";
import { authClient } from "../lib/auth-client";

export const SyncStatus = () => {
  const session = authClient.useSession();

  const isAuthenticated = () => !!session()?.data?.user;

  return (
    <div class="fixed bottom-4 right-4 z-50">
      <div
        class={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
          isAuthenticated()
            ? "bg-success/10 text-success border border-success/20"
            : "bg-base-300/50 text-base-content/50 border border-base-content/10"
        }`}
      >
        <Show when={isAuthenticated()} fallback={<FiCloudOff size={14} />}>
          <FiCloud size={14} />
        </Show>
        <span>{isAuthenticated() ? "Synced" : "Offline"}</span>
      </div>
    </div>
  );
};
