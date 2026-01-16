import { createFileRoute, Navigate } from "@tanstack/solid-router";
import { createResource, Show } from "solid-js";
import { FiCloud } from "solid-icons/fi";
import { ROOT_DOC_URL_KEY } from "../sync/utils";
import { client } from "../lib/orpc";

export const Route = createFileRoute("/sync")({
  component: RouteComponent,
});

function RouteComponent() {
  const [res] = createResource(async () => {
    const remoteDoc = await client.sync.getDocumentUrl();
    if (remoteDoc.documentUrl) {
      localStorage.setItem(ROOT_DOC_URL_KEY, remoteDoc.documentUrl);
    } else {
      const docUrl = localStorage.getItem(ROOT_DOC_URL_KEY);
      await client.sync.storeDocumentUrl({ docUrl: docUrl! });
    }
  });

  return (
    <div class="min-h-screen bg-atmospheric-auth flex items-center justify-center">
      <Show when={res.state === "ready"}>
        <Navigate to="/" />
      </Show>

      <Show when={res.loading}>
        <div class="text-center">
          <div class="flex justify-center mb-6">
            <div class="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
              <FiCloud class="w-8 h-8 text-primary animate-pulse" />
            </div>
          </div>
          <h1 class="font-heading text-2xl font-semibold text-base-content mb-2">
            Syncing your workspace
          </h1>
          <p class="text-base-content/50 mb-6">
            Please wait while we connect to the server...
          </p>
          <div class="flex justify-center">
            <span class="loading loading-spinner loading-md text-primary"></span>
          </div>
        </div>
      </Show>

      <Show when={res.error}>
        <div class="text-center">
          <div class="flex justify-center mb-6">
            <div class="w-16 h-16 rounded-full bg-error/10 border border-error/20 flex items-center justify-center">
              <FiCloud class="w-8 h-8 text-error" />
            </div>
          </div>
          <h1 class="font-heading text-2xl font-semibold text-base-content mb-2">
            Sync failed
          </h1>
          <p class="text-base-content/50 mb-6">
            Unable to connect to the server. Please try again.
          </p>
        </div>
      </Show>
    </div>
  );
}
