"use client";

import { usePathname } from "next/navigation";
import { Navbar, Footer } from "@/components/layout";

const AUTH_ROUTES = ["/auth/login", "/auth/register"];

export function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  return (
    <>
      {!isAuthPage && <Navbar />}
      <main className="flex-1">{children}</main>
      {!isAuthPage && <Footer />}
    </>
  );
}
