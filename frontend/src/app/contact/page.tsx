import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/informational/PageHero";
import ContactForm from "@/features/contact/ContactForm";

export const metadata: Metadata = {
  title: "Contact — VeloceMart",
  description:
    "Send the VeloceMart team a message about orders, products, accounts, technical issues, or privacy requests.",
};

const CONTACT_TOPICS = [
  {
    title: "Orders & delivery",
    description: "Questions about an order you have placed.",
    href: "/help/orders-and-order-status",
    label: "Orders & order status",
  },
  {
    title: "Account & sign-in",
    description: "Help with signing in, verification, or your profile.",
    href: "/help/sign-in-with-google",
    label: "Sign in with Google",
  },
  {
    title: "Privacy requests",
    description: "How we handle your data and your rights.",
    href: "/privacy",
    label: "Read the Privacy Policy",
  },
];

export default function ContactPage() {
  return (
    <div className="animate-fade-in">
      <PageHero
        eyebrow="Contact"
        title="Contact us"
        description="Have a question, feedback, or need a hand? Send us a message and we will reply by email to the address you provide."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Contact" }]}
      />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-12">
          <div className="min-w-0">
            <div className="rounded-2xl border border-border/50 bg-surface p-6 shadow-elevation-1 sm:p-8">
              <h2 className="text-lg font-semibold text-text-primary">
                Send a message
              </h2>
              <p className="mt-1.5 text-sm text-text-secondary">
                Fields marked with an asterisk are required.
              </p>
              <div className="mt-6">
                <ContactForm />
              </div>
            </div>
          </div>

          <aside className="mt-10 lg:mt-0">
            <div className="lg:sticky lg:top-24">
              <div className="rounded-2xl border border-border/50 bg-surface p-5">
                <h2 className="text-sm font-semibold text-text-primary">
                  Before you write
                </h2>
                <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">
                  Many answers are already in the Help Center, and it is
                  available at any time.
                </p>
                <Link
                  href="/help"
                  className="mt-4 inline-flex w-full items-center justify-center rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold text-text-primary transition-colors hover:border-accent-primary/60 hover:text-accent-strong"
                >
                  Visit Help Center
                </Link>
              </div>

              <div className="mt-6 space-y-4">
                {CONTACT_TOPICS.map((topic) => (
                  <div
                    key={topic.title}
                    className="rounded-xl border border-border/50 bg-surface/60 p-4"
                  >
                    <h3 className="text-sm font-semibold text-text-primary">
                      {topic.title}
                    </h3>
                    <p className="mt-1 text-sm text-text-secondary">
                      {topic.description}
                    </p>
                    <Link
                      href={topic.href}
                      className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-accent-strong hover:underline"
                    >
                      {topic.label}
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
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
