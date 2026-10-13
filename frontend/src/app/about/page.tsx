import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/informational/PageHero";
import { SupportCta } from "@/components/informational/SupportCta";

export const metadata: Metadata = {
  title: "About — VeloceMart",
  description:
    "Learn what VeloceMart is, how the store works, and how we approach your account, orders, and privacy.",
};

const FEATURES = [
  {
    title: "A curated catalogue",
    description:
      "Browse clothing and accessories for men, women, and kids, organised into categories and collections so it is easy to find what you are looking for.",
  },
  {
    title: "Search built in",
    description:
      "Use keyword search and category browsing to move from discovery to a product page in a couple of steps.",
  },
  {
    title: "A wishlist you control",
    description:
      "Save items to your wishlist while you decide, then add them to your cart when you are ready.",
  },
  {
    title: "A cart and checkout flow",
    description:
      "Review your bag and place an order from a single checkout flow, with your order history available in your account.",
  },
  {
    title: "Accounts that are yours",
    description:
      "Create an account with an email and password, or sign in with Google, and manage your saved addresses from your profile.",
  },
  {
    title: "Privacy by design",
    description:
      "We keep the data we collect to what the store needs to work and explain it in plain language in our Privacy Policy.",
  },
];

export default function AboutPage() {
  return (
    <div className="animate-fade-in">
      <PageHero
        eyebrow="About"
        title="About VeloceMart"
        description="VeloceMart is a curated fashion marketplace for men, women, and kids — built to make discovering and buying modern essentials feel effortless."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "About" }]}
      />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-16">
          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-semibold tracking-tight text-text-primary sm:text-2xl">
                Our approach
              </h2>
              <p className="mt-3 text-[15px] leading-relaxed text-text-secondary">
                We bring together a considered selection of clothing and
                accessories and pair it with a straightforward shopping
                experience. Rather than overwhelm you with endless listings, we
                organise the catalogue into clear categories and collections so
                you can get to the right piece quickly.
              </p>
              <p className="mt-3 text-[15px] leading-relaxed text-text-secondary">
                Every part of the store — search, the wishlist, the cart, and
                your account — is designed to work together and stay out of your
                way.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold tracking-tight text-text-primary sm:text-2xl">
                What you can do here
              </h2>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                {FEATURES.map((feature) => (
                  <div
                    key={feature.title}
                    className="rounded-2xl border border-border/50 bg-surface p-5"
                  >
                    <h3 className="text-sm font-semibold text-text-primary">
                      {feature.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold tracking-tight text-text-primary sm:text-2xl">
                Honest by default
              </h2>
              <p className="mt-3 text-[15px] leading-relaxed text-text-secondary">
                We do not make claims about our products or service that we
                cannot stand behind. Shipping, returns, payment terms, and
                retention practices are documented in our policies, and where
                something is not yet finalised we say so rather than guess.
              </p>
            </section>
          </div>

          <aside className="space-y-6">
            <div className="rounded-2xl border border-border/50 bg-surface p-6">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-text-muted">
                Find your way
              </h2>
              <ul className="mt-4 space-y-3 text-sm">
                {[
                  { label: "Browse the catalogue", href: "/products" },
                  { label: "Customer Help Center", href: "/help" },
                  { label: "Contact us", href: "/contact" },
                  { label: "Privacy Policy", href: "/privacy" },
                  { label: "Terms of Service", href: "/terms" },
                ].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="inline-flex items-center gap-1.5 text-text-secondary transition-colors hover:text-accent-strong"
                    >
                      {link.label}
                      <svg
                        className="h-3.5 w-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                        aria-hidden="true"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>

        <div className="mt-16">
          <SupportCta
            title="Questions about VeloceMart?"
            description="The Help Center covers accounts, shopping, and orders, and you can always send us a message."
          />
        </div>
      </div>
    </div>
  );
}
