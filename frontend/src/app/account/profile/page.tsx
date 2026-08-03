"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { getMyProfile, updateMyProfile, changePassword } from "@/lib/api";

export default function ProfilePage() {
  const { refreshUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordFieldErrors, setPasswordFieldErrors] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    let cancelled = false;
    getMyProfile()
      .then((user) => {
        if (!cancelled) {
          setFirstName(user.firstName);
          setLastName(user.lastName);
          setEmail(user.email);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess("");
    setProfileSaving(true);
    try {
      await updateMyProfile({ firstName, lastName, email });
      await refreshUser();
      setProfileSuccess("Profile updated successfully.");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to update profile.";
      setProfileError(message);
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");
    setPasswordFieldErrors({});

    const errors: Record<string, string> = {};
    if (!currentPassword) errors.currentPassword = "Current password is required.";
    if (!newPassword) errors.newPassword = "New password is required.";
    else if (newPassword.length < 8)
      errors.newPassword = "Password must be at least 8 characters.";
    if (!confirmPassword) errors.confirmPassword = "Please confirm your new password.";
    else if (confirmPassword !== newPassword)
      errors.confirmPassword = "Passwords do not match.";

    if (Object.keys(errors).length > 0) {
      setPasswordFieldErrors(errors);
      return;
    }

    setPasswordSaving(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setPasswordSuccess("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to change password.";
      setPasswordError(message);
    } finally {
      setPasswordSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[30vh] items-center justify-center">
        <div className="flex items-center gap-3 text-text-muted">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-accent-primary" />
          <span className="text-sm">Loading profile...</span>
        </div>
      </div>
    );
  }

  const inputClass = (hasError?: string) =>
    `mt-1 block w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition-all duration-200 ${
      hasError
        ? "border-error/60 ring-2 ring-error/10 focus:border-error"
        : "border-border focus:border-accent-primary focus:ring-3 focus:ring-accent-primary/10"
    } bg-surface text-text-primary placeholder:text-text-muted`;

  return (
    <div className="animate-fade-in space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">
          Profile &amp; Settings
        </h1>
        <p className="mt-1 text-text-secondary">
          Manage your personal information and security.
        </p>
      </div>

      {/* Profile Information Card */}
      <div className="rounded-xl border border-border/50 bg-surface p-6 sm:p-8 transition-all duration-200 hover:shadow-elevation-1">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-primary/10 text-accent-primary">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-semibold text-text-primary">
              Profile Information
            </h2>
            <p className="text-xs text-text-muted">
              Update your name and email address.
            </p>
          </div>
        </div>

        <form onSubmit={handleProfileSave} className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="firstName"
                className="text-sm font-medium text-text-primary"
              >
                First Name
              </label>
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={inputClass()}
                placeholder="John"
                required
              />
            </div>
            <div>
              <label
                htmlFor="lastName"
                className="text-sm font-medium text-text-primary"
              >
                Last Name
              </label>
              <input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={inputClass()}
                placeholder="Doe"
                required
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="email"
              className="text-sm font-medium text-text-primary"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass()}
              placeholder="john@example.com"
              required
            />
          </div>

          {/* Messages */}
          {profileError && (
            <div className="flex items-center gap-2 rounded-lg bg-error/10 px-4 py-3 text-sm text-error">
              <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              {profileError}
            </div>
          )}
          {profileSuccess && (
            <div className="flex items-center gap-2 rounded-lg bg-success/10 px-4 py-3 text-sm text-success">
              <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {profileSuccess}
            </div>
          )}

          <div className="flex justify-end border-t border-border/30 pt-5">
            <button
              type="submit"
              disabled={profileSaving}
              className="inline-flex items-center gap-2 rounded-lg bg-accent-primary px-5 py-2.5 text-sm font-medium text-background transition-all duration-200 hover:bg-accent-primary/90 hover:shadow-glow-accent disabled:opacity-50 active:scale-[0.98]"
            >
              {profileSaving ? (
                <>
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Change Password Card */}
      <div className="rounded-xl border border-border/50 bg-surface p-6 sm:p-8 transition-all duration-200 hover:shadow-elevation-1">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-primary/10 text-accent-primary">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-semibold text-text-primary">
              Change Password
            </h2>
            <p className="text-xs text-text-muted">
              Ensure your account stays secure with a strong password.
            </p>
          </div>
        </div>

        <form onSubmit={handlePasswordSave} className="space-y-5">
          <div>
            <label
              htmlFor="currentPassword"
              className="text-sm font-medium text-text-primary"
            >
              Current Password
            </label>
            <input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className={inputClass(passwordFieldErrors.currentPassword)}
              placeholder="Enter current password"
            />
            {passwordFieldErrors.currentPassword && (
              <p className="mt-1 flex items-center gap-1 text-xs text-error">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                {passwordFieldErrors.currentPassword}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="newPassword"
              className="text-sm font-medium text-text-primary"
            >
              New Password
            </label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={inputClass(passwordFieldErrors.newPassword)}
              placeholder="At least 8 characters"
            />
            {passwordFieldErrors.newPassword && (
              <p className="mt-1 flex items-center gap-1 text-xs text-error">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                {passwordFieldErrors.newPassword}
              </p>
            )}
            {newPassword && !passwordFieldErrors.newPassword && newPassword.length >= 8 && (
              <p className="mt-1 flex items-center gap-1 text-xs text-success">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Password strength looks good
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="confirmPassword"
              className="text-sm font-medium text-text-primary"
            >
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputClass(passwordFieldErrors.confirmPassword)}
              placeholder="Re-enter new password"
            />
            {passwordFieldErrors.confirmPassword && (
              <p className="mt-1 flex items-center gap-1 text-xs text-error">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                {passwordFieldErrors.confirmPassword}
              </p>
            )}
            {confirmPassword && confirmPassword === newPassword && !passwordFieldErrors.confirmPassword && (
              <p className="mt-1 flex items-center gap-1 text-xs text-success">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Passwords match
              </p>
            )}
          </div>

          {/* Messages */}
          {passwordError && (
            <div className="flex items-center gap-2 rounded-lg bg-error/10 px-4 py-3 text-sm text-error">
              <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              {passwordError}
            </div>
          )}
          {passwordSuccess && (
            <div className="flex items-center gap-2 rounded-lg bg-success/10 px-4 py-3 text-sm text-success">
              <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {passwordSuccess}
            </div>
          )}

          <div className="flex justify-end border-t border-border/30 pt-5">
            <button
              type="submit"
              disabled={passwordSaving}
              className="inline-flex items-center gap-2 rounded-lg bg-accent-primary px-5 py-2.5 text-sm font-medium text-background transition-all duration-200 hover:bg-accent-primary/90 hover:shadow-glow-accent disabled:opacity-50 active:scale-[0.98]"
            >
              {passwordSaving ? (
                <>
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                  Change Password
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
