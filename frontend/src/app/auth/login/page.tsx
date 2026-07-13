"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { ApiError } from "@/lib/api";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated, isLoading } = useAuth();

  const redirectTo = searchParams.get("redirect") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isLoading, isAuthenticated, router, redirectTo]);

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
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await login(email, password);
      router.push(redirectTo);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) setApiError("Invalid email or password");
        else setApiError(err.message);
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
            className="font-medium text-accent-primary hover:underline"
          >
            create a new account
          </Link>
        </p>
      </div>

      {apiError && (
        <div
          role="alert"
          className="rounded-lg border border-error/20 bg-error/10 p-3 text-sm text-error"
        >
          {apiError}
        </div>
      )}

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
          <label
            htmlFor="password"
            className="block text-sm font-medium text-text-primary"
          >
            Password
          </label>
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
        className="w-full rounded-lg bg-accent-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:opacity-90 disabled:opacity-50"
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
