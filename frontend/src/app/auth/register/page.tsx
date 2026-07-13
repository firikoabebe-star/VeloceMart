"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { ApiError } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const { register, isAuthenticated, isLoading } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/");
    }
  }, [isLoading, isAuthenticated, router]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!firstName.trim()) errs.firstName = "First name is required";
    if (!lastName.trim()) errs.lastName = "Last name is required";
    if (!email) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errs.email = "Invalid email address";
    if (!password) errs.password = "Password is required";
    else if (password.length < 8)
      errs.password = "Password must be at least 8 characters";
    if (!confirmPassword)
      errs.confirmPassword = "Please confirm your password";
    else if (password !== confirmPassword)
      errs.confirmPassword = "Passwords do not match";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError("");
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await register({ firstName, lastName, email, password });
      router.push("/");
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409) setApiError("Email already registered");
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
          Create your account
        </h2>
        <p className="text-sm text-text-secondary">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="font-medium text-accent-primary hover:underline"
          >
            Sign in
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
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="firstName"
              className="block text-sm font-medium text-text-primary"
            >
              First name
            </label>
            <input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="mt-1 block w-full"
              placeholder="John"
              autoComplete="given-name"
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-error">{errors.firstName}</p>
            )}
          </div>
          <div>
            <label
              htmlFor="lastName"
              className="block text-sm font-medium text-text-primary"
            >
              Last name
            </label>
            <input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="mt-1 block w-full"
              placeholder="Doe"
              autoComplete="family-name"
            />
            {errors.lastName && (
              <p className="mt-1 text-sm text-error">{errors.lastName}</p>
            )}
          </div>
        </div>

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
            autoComplete="new-password"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-error">{errors.password}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-text-primary"
          >
            Confirm password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="mt-1 block w-full"
            placeholder="••••••••"
            autoComplete="new-password"
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-error">
              {errors.confirmPassword}
            </p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-accent-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:opacity-90 disabled:opacity-50"
      >
        {isSubmitting ? "Creating account..." : "Create account"}
      </button>
    </form>
  );
}
