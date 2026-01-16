import { createFileRoute, Link, redirect } from "@tanstack/solid-router";
import { createSignal, For, Show, createResource, Suspense } from "solid-js";
import {
  FiGithub,
  FiKey,
  FiTrash2,
  FiPlus,
  FiLink,
  FiUser,
  FiArrowLeft,
  FiLogOut,
} from "solid-icons/fi";
import { authClient } from "../lib/auth-client";

export const Route = createFileRoute("/profile")({
  beforeLoad: async () => {
    const session = await authClient.getSession();
    if (!session.data?.user) {
      throw redirect({ to: "/login" });
    }
    return { user: session.data.user };
  },
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = Route.useRouteContext()();
  const [error, setError] = createSignal<string | null>(null);
  const [success, setSuccess] = createSignal<string | null>(null);

  return (
    <div class="min-h-screen bg-atmospheric p-4 md:p-8">
      <div class="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div class="flex items-center justify-between ">
          <h1 class="font-heading text-2xl font-semibold text-base-content">Profile Settings</h1>
          <Link to="/" class="btn btn-ghost btn-sm gap-2 text-base-content/70 hover:text-base-content">
            <FiArrowLeft size={16} />
            Back to app
          </Link>
        </div>

        {/* User Info Card */}
        <div class="glass-card rounded-xl  ">
          <div class="p-6">
            <div class="flex items-center gap-4">
              <div class="avatar-glow">
                <Show
                  when={user.image}
                  fallback={
                    <div class="bg-base-300/50 text-base-content/50 rounded-full w-16 h-16 flex items-center justify-center">
                      <FiUser class="w-8 h-8" />
                    </div>
                  }
                >
                  <div class="w-16 h-16 rounded-full overflow-hidden">
                    <img src={user.image!} alt={user.name || "User"} class="w-full h-full object-cover" />
                  </div>
                </Show>
              </div>
              <div>
                <h2 class="font-heading text-xl font-semibold text-base-content">{user.name || "User"}</h2>
                <p class="text-base-content/50">{user.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts */}
        <Show when={error()}>
          <div class="alert bg-error/10 border border-error/20 text-error rounded-lg ">
            <span>{error()}</span>
            <button class="btn btn-ghost btn-sm text-error hover:bg-error/10" onClick={() => setError(null)}>
              Dismiss
            </button>
          </div>
        </Show>
        <Show when={success()}>
          <div class="alert bg-success/10 border border-success/20 text-success rounded-lg ">
            <span>{success()}</span>
            <button
              class="btn btn-ghost btn-sm text-success hover:bg-success/10"
              onClick={() => setSuccess(null)}
            >
              Dismiss
            </button>
          </div>
        </Show>

        {/* Passkeys Section */}
        <Suspense fallback={<div class="skeleton h-48 w-full rounded-xl bg-base-300/20" />}>
          <PasskeysSection onError={setError} onSuccess={setSuccess} />
        </Suspense>

        {/* Linked Accounts Section */}
        <Suspense fallback={<div class="skeleton h-48 w-full rounded-xl bg-base-300/20" />}>
          <LinkedAccountsSection onError={setError} onSuccess={setSuccess} />
        </Suspense>

        {/* Sign Out */}
        <div class="glass-card rounded-xl  ">
          <div class="p-6">
            <h3 class="font-heading text-lg font-semibold text-base-content flex items-center gap-2">
              <FiLogOut class="w-5 h-5 text-error/70" />
              Session
            </h3>
            <p class="text-base-content/50 text-sm mt-1">
              Sign out of your current session.
            </p>
            <div class="flex justify-end mt-4">
              <button
                class="btn btn-outline border-error/30 text-error hover:bg-error/10 hover:border-error/50"
                onClick={async () => {
                  await authClient.signOut();
                  window.location.href = "/login";
                }}
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PasskeysSection(props: {
  onError: (msg: string) => void;
  onSuccess: (msg: string) => void;
}) {
  const [isAdding, setIsAdding] = createSignal(false);
  const [deletingId, setDeletingId] = createSignal<string | null>(null);

  const [passkeys, { refetch }] = createResource(async () => {
    const result = await authClient.passkey.listUserPasskeys();
    return result.data || [];
  });

  const handleAddPasskey = async () => {
    setIsAdding(true);
    props.onError("");
    try {
      const result = await authClient.passkey.addPasskey();
      if (result?.error) {
        props.onError(result.error.message || "Failed to add passkey");
      } else {
        props.onSuccess("Passkey added successfully");
        refetch();
      }
    } catch (err) {
      props.onError("Failed to add passkey. Please try again.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeletePasskey = async (id: string) => {
    setDeletingId(id);
    try {
      const result = await authClient.passkey.deletePasskey({ id });
      if (result?.error) {
        props.onError(result.error.message || "Failed to delete passkey");
      } else {
        props.onSuccess("Passkey deleted successfully");
        refetch();
      }
    } catch (err) {
      props.onError("Failed to delete passkey. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div class="glass-card rounded-xl  ">
      <div class="p-6">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="font-heading text-lg font-semibold text-base-content flex items-center gap-2">
              <FiKey class="w-5 h-5 text-primary" />
              Passkeys
            </h3>
            <p class="text-base-content/50 text-sm mt-1">
              Passkeys let you sign in securely using biometrics or your device PIN.
            </p>
          </div>
          <button
            class="btn btn-primary btn-sm gap-2 btn-glow"
            onClick={handleAddPasskey}
            disabled={isAdding()}
          >
            <Show when={isAdding()} fallback={<FiPlus class="w-4 h-4" />}>
              <span class="loading loading-spinner loading-xs" />
            </Show>
            Add passkey
          </button>
        </div>

        <div class="divider my-4 opacity-50" />

        <Show
          when={passkeys() && passkeys()!.length > 0}
          fallback={
            <p class="text-base-content/40 text-center py-6 text-sm">
              No passkeys registered yet.
            </p>
          }
        >
          <ul class="space-y-2">
            <For each={passkeys()}>
              {(passkey) => (
                <li class="flex items-center justify-between p-3 bg-base-300/20 rounded-lg border border-primary/5 hover:border-primary/10 transition-colors">
                  <div class="flex items-center gap-3">
                    <FiKey class="w-5 h-5 text-primary/70" />
                    <div>
                      <p class="font-medium text-base-content/90">
                        {passkey.name || passkey.deviceType || "Passkey"}
                      </p>
                      <p class="text-xs text-base-content/40">
                        Added {new Date(passkey.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button
                    class="btn btn-ghost btn-sm btn-square text-error/70 hover:text-error hover:bg-error/10"
                    onClick={() => handleDeletePasskey(passkey.id)}
                    disabled={deletingId() === passkey.id}
                  >
                    <Show
                      when={deletingId() === passkey.id}
                      fallback={<FiTrash2 class="w-4 h-4" />}
                    >
                      <span class="loading loading-spinner loading-xs" />
                    </Show>
                  </button>
                </li>
              )}
            </For>
          </ul>
        </Show>
      </div>
    </div>
  );
}

function LinkedAccountsSection(props: {
  onError: (msg: string) => void;
  onSuccess: (msg: string) => void;
}) {
  const [isLinking, setIsLinking] = createSignal<string | null>(null);
  const [unlinkingId, setUnlinkingId] = createSignal<string | null>(null);

  const [accounts, { refetch }] = createResource(async () => {
    const result = await authClient.listAccounts();
    return result.data || [];
  });

  const [passkeys] = createResource(async () => {
    const result = await authClient.passkey.listUserPasskeys();
    return result.data || [];
  });

  const canUnlink = () => {
    const accountCount = accounts()?.length || 0;
    const passkeyCount = passkeys()?.length || 0;
    return accountCount + passkeyCount > 1;
  };

  const handleLinkAccount = async (provider: "github" | "google") => {
    setIsLinking(provider);
    try {
      await authClient.linkSocial({
        provider,
        callbackURL: "/profile",
      });
    } catch (err) {
      props.onError(`Failed to link ${provider}. Please try again.`);
      setIsLinking(null);
    }
  };

  const handleUnlinkAccount = async (providerId: string) => {
    if (!canUnlink()) {
      props.onError("You must keep at least one authentication method linked.");
      return;
    }

    setUnlinkingId(providerId);
    try {
      const result = await authClient.unlinkAccount({ providerId });
      if (result?.error) {
        props.onError(result.error.message || "Failed to unlink account");
      } else {
        props.onSuccess("Account unlinked successfully");
        refetch();
      }
    } catch (err) {
      props.onError("Failed to unlink account. Please try again.");
    } finally {
      setUnlinkingId(null);
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case "github":
        return <FiGithub class="w-5 h-5" />;
      default:
        return <FiLink class="w-5 h-5" />;
    }
  };

  const isProviderLinked = (provider: string) => {
    return accounts()?.some((acc) => acc.providerId === provider);
  };

  return (
    <div class="glass-card rounded-xl  ">
      <div class="p-6">
        <div>
          <h3 class="font-heading text-lg font-semibold text-base-content flex items-center gap-2">
            <FiLink class="w-5 h-5 text-secondary" />
            Linked Accounts
          </h3>
          <p class="text-base-content/50 text-sm mt-1">
            Connect social accounts for easier sign-in. You must keep at least one authentication method.
          </p>
        </div>

        <div class="divider my-4 opacity-50" />

        {/* Linked accounts list */}
        <Show
          when={accounts() && accounts()!.length > 0}
          fallback={
            <p class="text-base-content/40 text-center py-6 text-sm">
              No social accounts linked.
            </p>
          }
        >
          <ul class="space-y-2 mb-4">
            <For each={accounts()}>
              {(account) => (
                <li class="flex items-center justify-between p-3 bg-base-300/20 rounded-lg border border-secondary/5 hover:border-secondary/10 transition-colors">
                  <div class="flex items-center gap-3">
                    <span class="text-secondary/70">{getProviderIcon(account.providerId)}</span>
                    <div>
                      <p class="font-medium capitalize text-base-content/90">{account.providerId}</p>
                      <p class="text-xs text-base-content/40">Connected</p>
                    </div>
                  </div>
                  <button
                    class="btn btn-ghost btn-sm gap-1 text-error/70 hover:text-error hover:bg-error/10"
                    onClick={() => handleUnlinkAccount(account.providerId)}
                    disabled={
                      unlinkingId() === account.providerId || !canUnlink()
                    }
                    title={
                      !canUnlink()
                        ? "You must keep at least one auth method"
                        : "Unlink account"
                    }
                  >
                    <Show
                      when={unlinkingId() === account.providerId}
                      fallback={<FiTrash2 class="w-4 h-4" />}
                    >
                      <span class="loading loading-spinner loading-xs" />
                    </Show>
                    Unlink
                  </button>
                </li>
              )}
            </For>
          </ul>
        </Show>

        {/* Link new accounts */}
        <div class="space-y-2">
          <p class="text-sm font-medium text-base-content/70">Link a new account:</p>
          <div class="flex flex-wrap gap-2">
            <button
              class="btn btn-outline btn-sm gap-2 border-base-content/10 hover:border-primary/30 hover:bg-primary/10"
              onClick={() => handleLinkAccount("github")}
              disabled={isLinking() !== null || isProviderLinked("github")}
            >
              <Show
                when={isLinking() === "github"}
                fallback={<FiGithub class="w-4 h-4" />}
              >
                <span class="loading loading-spinner loading-xs" />
              </Show>
              {isProviderLinked("github") ? "GitHub linked" : "Link GitHub"}
            </button>

            <button
              class="btn btn-outline btn-sm gap-2 border-base-content/10"
              disabled
              title="Coming soon"
            >
              <svg class="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google (soon)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
