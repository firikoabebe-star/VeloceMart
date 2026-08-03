"use client";

import { usePathname } from "next/navigation";
import { Navbar, Footer } from "@/components/layout";

const AUTH_ROUTES = ["/auth/login", "/auth/register"];
const ADMIN_PREFIX = "/admin";
const ACCOUNT_PREFIX = "/account";

export function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage = AUTH_ROUTES.some((route) => pathname.startsWith(route));
  const isAdminPage = pathname.startsWith(ADMIN_PREFIX);
  const isAccountPage = pathname.startsWith(ACCOUNT_PREFIX);
  const isDashboard = isAdminPage || isAccountPage;

  return (
    <>
      {!isAuthPage && !isDashboard && <Navbar />}
      <main className="flex-1">{children}</main>
      {!isAuthPage && !isDashboard && <Footer />}
    </>
  );
}
