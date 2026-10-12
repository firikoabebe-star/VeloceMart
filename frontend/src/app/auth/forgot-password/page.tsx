"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { ApiError } from "@/lib/api";
import {
  getForgotPasswordErrorMessage,
  getResetPasswordErrorMessage,
} from "@/features/auth/error-messages";
import {
  OTP_LENGTH,
  validateResetEmail,
  validateResetForm,
} from "@/features/auth/password-reset-validation";

const RESET_CODE_COOLDOWN_SECONDS = 60;
const LOGIN_REDIRECT_DELAY_MS = 3000;
const GENERIC_SENT_MESSAGE =
  "If an account exists for this email, a reset code has been sent.";

type Step = "request" | "reset" | "done";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { forgotPassword, resetPassword } = useAuth();

  const [step, setStep] = useState<Step>("request");
  const [email, setEmail] = useState("");
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState("");
  const [notice, setNotice] = useState("");
  const [isRequesting, setIsRequesting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const code = digits.join("");

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  useEffect(() => {
    if (step === "reset") inputsRef.current[0]?.focus();
  }, [step]);

  useEffect(() => {
    if (step !== "done") return;
    const timer = setTimeout(
      () => router.replace("/auth/login"),
      LOGIN_REDIRECT_DELAY_MS,
    );
    return () => clearTimeout(timer);
  }, [step, router]);

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
    setApiError("");
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
    setApiError("");
    fillFrom(index, pasted);
  };

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError("");
    setNotice("");

    const emailError = validateResetEmail(email);
    setErrors(emailError ? { email: emailError } : {});
    if (emailError) return;

    setIsRequesting(true);
    try {
      await forgotPassword(email);
      setNotice(GENERIC_SENT_MESSAGE);
      setCooldown(RESET_CODE_COOLDOWN_SECONDS);
      setStep("reset");
    } catch (err) {
      setApiError(getForgotPasswordErrorMessage(err));
    } finally {
      setIsRequesting(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || isResending) return;
    setApiError("");
    setNotice("");
    setIsResending(true);
    try {
      await forgotPassword(email);
      setNotice(GENERIC_SENT_MESSAGE);
      setDigits(Array(OTP_LENGTH).fill(""));
      focusInput(0);
      setCooldown(RESET_CODE_COOLDOWN_SECONDS);
    } catch (err) {
      if (err instanceof ApiError && err.status === 429) {
        setCooldown(RESET_CODE_COOLDOWN_SECONDS);
      }
      setApiError(getForgotPasswordErrorMessage(err));
    } finally {
      setIsResending(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError("");
    setNotice("");

    const errs = validateResetForm({ code, newPassword, confirmPassword });
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setIsResetting(true);
    try {
      await resetPassword({ email, code, newPassword });
      setStep("done");
    } catch (err) {
      setApiError(getResetPasswordErrorMessage(err));
      // A rejected code (invalid, expired, already used) can never be retried,
      // so clear it. Connectivity and throttling failures keep the input so the
      // user can simply resubmit.
      if (err instanceof ApiError && err.status === 400) {
        setDigits(Array(OTP_LENGTH).fill(""));
        focusInput(0);
      }
    } finally {
      setIsResetting(false);
    }
  };

  const handleChangeEmail = () => {
    setStep("request");
    setApiError("");
    setNotice("");
    setErrors({});
    setDigits(Array(OTP_LENGTH).fill(""));
    setNewPassword("");
    setConfirmPassword("");
  };

  if (step === "done") {
    return (
      <div className="space-y-6 text-center">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-text-primary">
            Password reset
          </h2>
          <p className="text-sm text-text-secondary">
            Your password has been reset. Sign in with your new password.
          </p>
        </div>
        <Link
          href="/auth/login"
          className="block w-full rounded-lg bg-accent-primary px-4 py-2.5 text-sm font-semibold text-on-accent transition-colors hover:opacity-90"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-xl font-semibold text-text-primary">
          {step === "request" ? "Reset your password" : "Enter reset code"}
        </h2>
        <p className="text-sm text-text-secondary">
          {step === "request"
            ? "Enter the email associated with your account and we'll send you a reset code."
            : "Enter the 6-digit code we sent to "}
          {step === "reset" && (
            <span className="font-medium text-text-primary">{email}</span>
          )}
          {step === "reset" && " and choose a new password."}
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

      {notice && (
        <div
          role="status"
          className="rounded-lg border border-success/20 bg-success/10 p-3 text-sm text-success"
        >
          {notice}
        </div>
      )}

      {step === "request" ? (
        <form onSubmit={handleRequest} className="space-y-6">
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

          <button
            type="submit"
            disabled={isRequesting}
            className="w-full rounded-lg bg-accent-primary px-4 py-2.5 text-sm font-semibold text-on-accent transition-colors hover:opacity-90 disabled:opacity-50"
          >
            {isRequesting ? "Sending reset code..." : "Send reset code"}
          </button>

          <p className="text-center text-sm text-text-secondary">
            Remember your password?{" "}
            <Link
              href="/auth/login"
              className="font-medium text-accent-strong hover:underline"
            >
              Sign in
            </Link>
          </p>
        </form>
      ) : (
        <form onSubmit={handleReset} className="space-y-6">
          <div>
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
                  aria-label={`Reset code digit ${i + 1}`}
                  className="h-12 w-10 p-0 text-center text-lg font-semibold sm:h-14 sm:w-12"
                />
              ))}
            </div>
            {errors.code && (
              <p className="mt-2 text-center text-sm text-error">
                {errors.code}
              </p>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-text-primary"
              >
                New password
              </label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1 block w-full"
                placeholder="••••••••"
                autoComplete="new-password"
              />
              {errors.newPassword && (
                <p className="mt-1 text-sm text-error">{errors.newPassword}</p>
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
            disabled={isResetting || code.length !== OTP_LENGTH}
            className="w-full rounded-lg bg-accent-primary px-4 py-2.5 text-sm font-semibold text-on-accent transition-colors hover:opacity-90 disabled:opacity-50"
          >
            {isResetting ? "Resetting password..." : "Reset password"}
          </button>

          <div className="space-y-3 text-center text-sm text-text-secondary">
            <p>
              Didn&apos;t receive the code?{" "}
              {cooldown > 0 ? (
                <span className="text-text-muted">
                  Request another code in {cooldown}s
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isResending}
                  className="font-medium text-accent-strong hover:underline disabled:opacity-50"
                >
                  {isResending ? "Sending..." : "Request another code"}
                </button>
              )}
            </p>
            <p>
              <button
                type="button"
                onClick={handleChangeEmail}
                className="font-medium text-accent-strong hover:underline"
              >
                Use a different email
              </button>
            </p>
          </div>
        </form>
      )}
    </div>
  );
}
