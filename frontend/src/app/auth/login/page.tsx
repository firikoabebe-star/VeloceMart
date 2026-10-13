"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useAuthStore } from "@/stores/auth-store";
import { ApiError } from "@/lib/api";
import type { User } from "@/lib/api";
import { getGoogleSignInErrorMessage } from "@/features/auth/error-messages";
import AuthDivider from "@/features/auth/components/AuthDivider";
import GoogleSignInButton from "@/features/auth/components/GoogleSignInButton";

const AUTH_ROUTES = ["/auth/login", "/auth/register"];

/**
 * Where to land after a successful sign-in. `?redirect=` is set by AuthGuard and
 * takes priority, but only same-origin paths are honoured so it cannot be used as
 * an open redirect (`//evil.com`, `https://evil.com`) or bounce back to the auth
 * pages in a loop.
 */
function postLoginPath(redirect: string | null, user: User | null | undefined) {
  const isSafeTarget =
    redirect !== null &&
    redirect.startsWith("/") &&
    !redirect.startsWith("//") &&
    !AUTH_ROUTES.some((route) => redirect.startsWith(route));

  if (isSafeTarget) return redirect;
  return user?.role === "ADMIN" ? "/admin" : "/account";
}

function LoginForm() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { login, user, isAuthenticated, isLoading } = useAuth();
  const redirect = searchParams.get("redirect");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState("");
  const [oauthError, setOauthError] = useState("");
  const [googleOnlyAccount, setGoogleOnlyAccount] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const clearedOauthError = useRef(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(postLoginPath(redirect, user));
    }
  }, [isLoading, isAuthenticated, router, user, redirect]);

  // The Google callback redirects here with `?error=<code>`. Map the code to
  // friendly copy once, then strip it from the URL so a refresh or back
  // navigation can't show a stale error. Other params (e.g. `?redirect=`) are
  // preserved.
  useEffect(() => {
    const code = searchParams.get("error");
    if (!code || clearedOauthError.current) return;
    clearedOauthError.current = true;
    setOauthError(getGoogleSignInErrorMessage(code));

    const params = new URLSearchParams(searchParams.toString());
    params.delete("error");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  }, [searchParams, pathname, router]);

  // A failed email/password attempt takes precedence over an OAuth error.
  const displayError = apiError || oauthError;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!email) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errs.email = "Invalid email address";
    if (!password) errs.password = "Password is required";
    else if (password.length < 8)
      errs.password = "Password must be at least 8 characters";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError("");
    setOauthError("");
    setUnverifiedEmail("");
    setGoogleOnlyAccount(false);
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await login(email, password);
      const loggedUser = useAuthStore.getState().user;
      router.replace(postLoginPath(redirect, loggedUser));
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 403) {
          setUnverifiedEmail(email);
          setApiError("Please verify your email before signing in.");
        } else if (err.status === 401) {
          // Google-only accounts have no password; the backend returns a
          // dedicated 401 message instead of generic invalid credentials.
          if (err.message.toLowerCase().includes("uses google sign-in")) {
            setGoogleOnlyAccount(true);
          } else {
            setApiError("Invalid email or password");
          }
        } else {
          setApiError(err.message);
        }
      } else {
        setApiError("An unexpected error occurred");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-accent-primary" />
      </div>
    );
  }

  if (isAuthenticated) return null;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-xl font-semibold text-text-primary">
          Sign in to your account
        </h2>
        <p className="text-sm text-text-secondary">
          Or{" "}
          <Link
            href="/auth/register"
            className="font-medium text-accent-strong hover:underline"
          >
            create a new account
          </Link>
        </p>
      </div>

      {googleOnlyAccount ? (
        // Prominent Google-only-account panel: password login can never
        // succeed here, so make the Google path (and password reset) obvious.
        <div
          role="alert"
          className="space-y-3 rounded-lg border border-warning/30 bg-warning/10 p-4"
        >
          <p className="text-sm font-medium text-text-primary">
            This account uses Google sign-in. Continue with Google, or use
            Forgot password to create a password.
          </p>
          <GoogleSignInButton label="Continue with Google" />
          <p className="text-sm text-text-secondary">
            <Link
              href="/auth/forgot-password"
              className="font-medium text-accent-strong hover:underline"
            >
              Forgot password?
            </Link>
          </p>
        </div>
      ) : (
        <>
          {displayError && (
            <div
              role="alert"
              className="rounded-lg border border-error/20 bg-error/10 p-3 text-sm text-error"
            >
              <p>{displayError}</p>
              {unverifiedEmail && (
                <Link
                  href={`/auth/verify-email?email=${encodeURIComponent(
                    unverifiedEmail,
                  )}`}
                  className="mt-2 inline-block font-medium text-accent-strong hover:underline"
                >
                  Verify your email
                </Link>
              )}
            </div>
          )}

          <GoogleSignInButton />
        </>
      )}
      <AuthDivider />

      <div className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-text-primary"
          >
            Email address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full"
            placeholder="you@example.com"
            autoComplete="email"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-error">{errors.email}</p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-text-primary"
            >
              Password
            </label>
            <Link
              href="/auth/forgot-password"
              className="text-sm font-medium text-accent-strong hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full"
            placeholder="••••••••"
            autoComplete="current-password"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-error">{errors.password}</p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-accent-primary px-4 py-2.5 text-sm font-semibold text-on-accent transition-colors hover:opacity-90 disabled:opacity-50"
      >
        {isSubmitting ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-accent-primary" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
