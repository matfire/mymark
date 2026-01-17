import {
  RepoContext,
  useDocHandle,
  useDocument,
} from "@automerge/automerge-repo-solid-primitives";
import { createFileRoute, Link } from "@tanstack/solid-router";
import { getOrCreateRoot } from "../sync/utils";
import { FileTree } from "../components/file-tree";
import type { Workspace } from "@mymark/common/repo";
import { Show, useContext, createSignal } from "solid-js";
import { useSelectedFile } from "../contexts/selected-file";
import { Editor } from "../components/editor";
import { authClient } from "../lib/auth-client";
import { FiUser, FiLogIn, FiFileText, FiDownload } from "solid-icons/fi";
import { downloadWorkspace } from "../utils/export-utils";
import { SyncStatus } from "../components/sync-status";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  const repo = useContext(RepoContext);
  const docUrl = getOrCreateRoot(repo!);
  const doc = useDocHandle<Workspace>(docUrl);
  const [workspace] = useDocument<Workspace>(() => doc()?.url);
  const [selectedFileId] = useSelectedFile();
  const session = authClient.useSession();
  const [isExporting, setIsExporting] = createSignal(false);

  const handleExport = async () => {
    const ws = workspace();
    if (!ws || isExporting()) return;

    setIsExporting(true);
    try {
      await downloadWorkspace(ws);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div class="flex flex-col h-screen bg-atmospheric">
      {/* Header */}
      <header class="shrink-0 h-12 flex items-center justify-between px-4 border-b border-primary/10 bg-base-200/30 backdrop-blur-sm">
        <div class="flex items-center gap-2">
          <span class="font-heading text-lg font-semibold text-primary">
            MyMark
          </span>
        </div>
        <div class="flex items-center gap-2">
          <Show when={doc()?.doneLoading}>
            <button
              type="button"
              onClick={handleExport}
              disabled={isExporting()}
              class="btn btn-ghost btn-sm gap-2 text-base-content/70 hover:text-primary"
              title="Export workspace as ZIP"
            >
              <Show
                when={!isExporting()}
                fallback={<span class="loading loading-spinner loading-xs" />}
              >
                <FiDownload size={16} />
              </Show>
              <span class="hidden sm:inline">Export</span>
            </button>
          </Show>
          <Show
            when={session()?.data?.user}
            fallback={
              <Link
                to="/login"
                class="btn btn-ghost btn-sm gap-2 text-base-content/70 hover:text-primary"
              >
                <FiLogIn size={16} />
                Sign in
              </Link>
            }
          >
            {(user) => (
              <Link
                to="/profile"
                class="btn btn-ghost btn-sm gap-2 text-base-content/70 hover:text-primary"
              >
                <Show when={user().image} fallback={<FiUser size={16} />}>
                  <img
                    src={user().image!}
                    alt={user().name || "User"}
                    class="w-5 h-5 rounded-full"
                  />
                </Show>
                <span class="hidden sm:inline">{user().name || "Profile"}</span>
              </Link>
            )}
          </Show>
        </div>
      </header>

      {/* Main content */}
      <div class="flex flex-1 min-h-0">
        <Show
          when={doc()?.doneLoading}
          fallback={
            <div class="flex flex-1 items-center justify-center">
              <div class="text-center">
                <div class="flex justify-center mb-6">
                  <div class="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <FiFileText class="w-8 h-8 text-primary animate-pulse" />
                  </div>
                </div>
                <h1 class="font-heading text-2xl font-semibold text-base-content mb-2">
                  Loading your workspace
                </h1>
                <p class="text-base-content/50 mb-6">
                  Please wait while we load your documents...
                </p>
                <div class="flex justify-center">
                  <span class="loading loading-spinner loading-md text-primary"></span>
                </div>
              </div>
            </div>
          }
        >
          <aside class="w-64 shrink-0 glass-sidebar">
            <FileTree docUrl={doc()!.url} />
          </aside>
          <main class="flex-1 overflow-y-auto p-6">
            <Show
              when={selectedFileId()}
              fallback={
                <div class="h-full flex items-center justify-center">
                  <div class="text-center opacity-50">
                    <p class="font-heading text-xl text-base-content/60">
                      Select a note to begin writing
                    </p>
                    <p class="text-sm text-base-content/40 mt-2">
                      Your midnight manuscript awaits
                    </p>
                  </div>
                </div>
              }
            >
              <div class="h-full paper-glow">
                <Editor />
              </div>
            </Show>
          </main>
        </Show>
      </div>

      {/* Sync status indicator */}
      <Show when={doc()?.doneLoading}>
        <SyncStatus doc={doc()!} />
      </Show>
    </div>
  );
}
