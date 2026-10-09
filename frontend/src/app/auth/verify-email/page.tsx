"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { ApiError } from "@/lib/api";
import {
  VERIFY_EMAIL_ERROR_MESSAGES,
  getResendOtpErrorMessage,
  getVerifyEmailErrorMessage,
} from "@/features/auth/error-messages";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 60;

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const { verifyEmail, resendOtp, user, isAuthenticated, isLoading } = useAuth();

  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const code = digits.join("");

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(user?.role === "ADMIN" ? "/admin" : "/account");
    }
  }, [isLoading, isAuthenticated, router, user]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  const focusInput = (index: number) => {
    const el = inputsRef.current[index];
    if (el) {
      el.focus();
      el.select();
    }
  };

  const fillFrom = (start: number, value: string) => {
    const chars = value
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH - start)
      .split("");
    if (chars.length === 0) return;
    setDigits((prev) => {
      const next = [...prev];
      chars.forEach((char, i) => {
        next[start + i] = char;
      });
      return next;
    });
    focusInput(Math.min(start + chars.length, OTP_LENGTH - 1));
  };

  const handleChange = (index: number, value: string) => {
    setError("");
    const digit = value.replace(/\D/g, "");
    if (digit.length > 1) {
      fillFrom(index, digit);
      return;
    }
    setDigits((prev) => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });
    if (digit) focusInput(Math.min(index + 1, OTP_LENGTH - 1));
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (digits[index]) {
        setDigits((prev) => {
          const next = [...prev];
          next[index] = "";
          return next;
        });
      } else if (index > 0) {
        setDigits((prev) => {
          const next = [...prev];
          next[index - 1] = "";
          return next;
        });
        focusInput(index - 1);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      focusInput(index - 1);
    } else if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      e.preventDefault();
      focusInput(index + 1);
    }
  };

  const handlePaste = (
    index: number,
    e: React.ClipboardEvent<HTMLInputElement>,
  ) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "");
    if (!pasted) return;
    e.preventDefault();
    setError("");
    fillFrom(index, pasted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setNotice("");
    if (code.length !== OTP_LENGTH) {
      setError(VERIFY_EMAIL_ERROR_MESSAGES.incomplete);
      return;
    }

    setIsVerifying(true);
    try {
      await verifyEmail(email, code);
      // The auth effect above redirects once the session is established.
    } catch (err) {
      setError(getVerifyEmailErrorMessage(err));
      setDigits(Array(OTP_LENGTH).fill(""));
      focusInput(0);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || isResending || !email) return;
    setError("");
    setNotice("");
    setIsResending(true);
    try {
      await resendOtp(email);
      setNotice("A new verification code has been sent to your email.");
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      if (err instanceof ApiError && err.status === 429) {
        setCooldown(RESEND_COOLDOWN_SECONDS);
      }
      setError(getResendOtpErrorMessage(err));
    } finally {
      setIsResending(false);
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

  if (!email) {
    return (
      <div className="space-y-6 text-center">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-text-primary">
            Verify your email
          </h2>
          <p className="text-sm text-text-secondary">
            We couldn&apos;t find an email address to verify. Please sign in or
            create an account to receive a verification code.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <Link
            href="/auth/login"
            className="w-full rounded-lg bg-accent-primary px-4 py-2.5 text-sm font-semibold text-on-accent transition-colors hover:opacity-90"
          >
            Sign in
          </Link>
          <Link
            href="/auth/register"
            className="text-sm font-medium text-accent-strong hover:underline"
          >
            Create an account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-xl font-semibold text-text-primary">
          Verify your email
        </h2>
        <p className="text-sm text-text-secondary">
          Enter the 6-digit code we sent to{" "}
          <span className="font-medium text-text-primary">{email}</span>
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-error/20 bg-error/10 p-3 text-sm text-error"
        >
          {error}
        </div>
      )}

      {notice && (
        <div
          role="status"
          className="rounded-lg border border-success/20 bg-success/10 p-3 text-sm text-success"
        >
          {notice}
        </div>
      )}

      <div className="flex justify-center gap-2 sm:gap-3">
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={(el) => {
              inputsRef.current[i] = el;
            }}
            type="text"
            inputMode="numeric"
            autoComplete={i === 0 ? "one-time-code" : "off"}
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={(e) => handlePaste(i, e)}
            onFocus={(e) => e.target.select()}
            aria-label={`Digit ${i + 1}`}
            className="h-12 w-10 p-0 text-center text-lg font-semibold sm:h-14 sm:w-12"
          />
        ))}
      </div>

      <button
        type="submit"
        disabled={isVerifying || code.length !== OTP_LENGTH}
        className="w-full rounded-lg bg-accent-primary px-4 py-2.5 text-sm font-semibold text-on-accent transition-colors hover:opacity-90 disabled:opacity-50"
      >
        {isVerifying ? "Verifying..." : "Verify"}
      </button>

      <div className="space-y-3 text-center text-sm text-text-secondary">
        <p>
          Didn&apos;t receive the code?{" "}
          {cooldown > 0 ? (
            <span className="text-text-muted">
              Resend code in {cooldown}s
            </span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending}
              className="font-medium text-accent-strong hover:underline disabled:opacity-50"
            >
              {isResending ? "Sending..." : "Resend code"}
            </button>
          )}
        </p>
        <p>
          <Link
            href="/auth/login"
            className="font-medium text-accent-strong hover:underline"
          >
            Back to sign in
          </Link>
        </p>
      </div>
    </form>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-accent-primary" />
        </div>
      }
    >
      <VerifyEmailForm />
    </Suspense>
  );
}
