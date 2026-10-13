import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/informational/PageHero";
import { HELP_ARTICLES } from "@/lib/help";

export const metadata: Metadata = {
  title: "Sitemap — VeloceMart",
  description:
    "An index of the public pages on VeloceMart, including the shop, help center, and policies.",
};

interface SitemapLink {
  label: string;
  href: string;
}

interface SitemapGroup {
  heading: string;
  description?: string;
  links: SitemapLink[];
}

const GROUPS: SitemapGroup[] = [
  {
    heading: "Shop",
    description: "Browse the catalogue and curated collections.",
    links: [
      { label: "Home", href: "/" },
      { label: "All products", href: "/products" },
      { label: "New arrivals", href: "/collections/new" },
      { label: "Best sellers", href: "/collections/bestsellers" },
      { label: "Sale", href: "/sale" },
      { label: "Men", href: "/men" },
      { label: "Women", href: "/women" },
      { label: "Kids", href: "/kids" },
    ],
  },
  {
    heading: "Help & support",
    links: [
      { label: "Help Center", href: "/help" },
      { label: "Contact us", href: "/contact" },
    ],
  },
  {
    heading: "Company & policies",
    links: [
      { label: "About", href: "/about" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Sitemap", href: "/sitemap" },
    ],
  },
  {
    heading: "Your account",
    description: "Sign-in is required for account pages.",
    links: [
      { label: "Sign in", href: "/auth/login" },
      { label: "Create an account", href: "/auth/register" },
      { label: "Forgot password", href: "/auth/forgot-password" },
      { label: "Your account", href: "/account" },
    ],
  },
];

export default function SitemapPage() {
  return (
    <div className="animate-fade-in">
      <PageHero
        eyebrow="Sitemap"
        title="Sitemap"
        description="Every public page on VeloceMart, grouped so you can find what you need."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Sitemap" }]}
      />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {GROUPS.map((group) => (
            <section key={group.heading}>
              <h2 className="text-sm font-semibold uppercase tracking-widest text-text-muted">
                {group.heading}
              </h2>
              {group.description && (
                <p className="mt-2 text-sm text-text-secondary">
                  {group.description}
                </p>
              )}
              <ul className="mt-4 space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-text-secondary transition-colors hover:text-accent-strong"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}

          <section className="sm:col-span-2 lg:col-span-1">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-text-muted">
              Help articles
            </h2>
            <ul className="mt-4 space-y-2.5">
              {HELP_ARTICLES.map((article) => (
                <li key={article.slug}>
                  <Link
                    href={`/help/${article.slug}`}
                    className="text-sm text-text-secondary transition-colors hover:text-accent-strong"
                  >
                    {article.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
