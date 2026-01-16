import { createFileRoute, Link } from "@tanstack/solid-router";
import { createSignal, Show } from "solid-js";
import { FiGithub } from "solid-icons/fi";
import { authClient } from "../lib/auth-client";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const [isLoading, setIsLoading] = createSignal<
    "github" | "google" | "passkey" | null
  >(null);
  const [error, setError] = createSignal<string | null>(null);

  const handlePasskeySignIn = async () => {
    setIsLoading("passkey");
    setError(null);

    try {
      const result = await authClient.signIn.passkey();
      if (result?.error) {
        setError(result.error.message || "Failed to sign in with passkey.");
        setIsLoading(null);
      }
    } catch (err) {
      setError("Failed to sign in with passkey. Please try again.");
      setIsLoading(null);
    }
  };

  const handleGitHubSignIn = async () => {
    setIsLoading("github");
    setError(null);

    try {
      await authClient.signIn.social({
        provider: "github",
        callbackURL: `${window.location.origin}/sync`,
      });
    } catch (err) {
      setError("Failed to sign in with GitHub. Please try again.");
      setIsLoading(null);
    }
  };

  const handleGoogleSignIn = () => {
    setError("Google sign in is coming soon!");
  };

  return (
    <div class="flex min-h-screen items-center justify-center bg-atmospheric-auth p-4 relative overflow-hidden">
      {/* Animated gradient orb */}
      <div class="absolute top-1/2 left-1/2 w-150 h-150 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <div class="absolute inset-0 bg-linear-to-br from-primary/20 via-secondary/10 to-accent/10 rounded-full blur-3xl animate-gradient-orb" />
      </div>

      <div class="w-full max-w-md relative z-10">
        <div class="glass-card rounded-2xl shadow-2xl ">
          <div class="p-8">
            {/* Header */}
            <div class="text-center mb-6  ">
              <h1 class="font-heading text-3xl font-semibold text-base-content">
                Welcome back
              </h1>
              <p class="text-base-content/50 mt-2">
                Sign in to your MyMark account
              </p>
            </div>

            {/* Error Alert */}
            <Show when={error()}>
              <div class="alert bg-error/10 border border-error/20 text-error mb-4 rounded-lg ">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <span>{error()}</span>
              </div>
            </Show>

            {/* Passkey Sign In */}
            <div class=" ">
              <button
                class="btn btn-accent w-full gap-2 btn-glow"
                onClick={handlePasskeySignIn}
                disabled={isLoading() !== null}
              >
                <Show
                  when={isLoading() === "passkey"}
                  fallback={
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
                      />
                    </svg>
                  }
                >
                  <span class="loading loading-spinner loading-sm" />
                </Show>
                Sign in with Passkey
              </button>
            </div>

            {/* Divider */}
            <div class="divider text-xs text-base-content/40 my-6  ">
              or continue with
            </div>

            {/* Social Login Buttons */}
            <div class="space-y-3  ">
              {/* GitHub Button */}
              <button
                class="btn btn-neutral w-full gap-2 bg-base-300/50 border-primary/10 hover:bg-base-300/80 hover:border-primary/20"
                onClick={handleGitHubSignIn}
                disabled={isLoading() !== null}
              >
                <Show
                  when={isLoading() === "github"}
                  fallback={<FiGithub class="h-5 w-5" />}
                >
                  <span class="loading loading-spinner loading-sm" />
                </Show>
                Continue with GitHub
              </button>

              {/* Google Button - Placeholder */}
              <button
                class="btn btn-outline w-full gap-2 border-base-content/10 hover:border-base-content/20 hover:bg-base-300/30"
                onClick={handleGoogleSignIn}
                disabled
              >
                <svg class="h-5 w-5" viewBox="0 0 24 24">
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
                Continue with Google
                <span class="badge badge-sm bg-base-300/50 border-primary/20 text-primary/80">
                  Soon
                </span>
              </button>
            </div>

            {/* Sign Up Link */}
            <div class="divider my-6" />
            <p class="text-center text-sm text-base-content/70  ">
              Don't have an account?{" "}
              <Link
                to="/register"
                class="link link-primary font-medium hover:text-primary"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
