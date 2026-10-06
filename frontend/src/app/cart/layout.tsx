"use client";

import AuthGuard from "@/features/auth/components/AuthGuard";

export default function CartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard loadingClassName="flex min-h-[60vh] items-center justify-center">
      {children}
    </AuthGuard>
  );
}
