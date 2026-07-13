import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "VeloceMart — Authentication",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-block">
            <div className="flex items-center justify-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-primary">
                <span className="text-lg font-bold text-background">V</span>
              </div>
              <span className="text-2xl font-bold tracking-tight text-text-primary">
                Veloce<span className="text-accent-primary">Mart</span>
              </span>
            </div>
          </Link>
        </div>
        <div className="rounded-2xl border border-border/50 bg-surface p-8 shadow-elevation-2">
          {children}
        </div>
      </div>
    </div>
  );
}
