import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/informational/PageHero";
import { SupportCta } from "@/components/informational/SupportCta";
import { LegalPage } from "@/components/legal/LegalPage";
import { TERMS_OF_SERVICE } from "@/lib/legal/terms";

export const metadata: Metadata = {
  title: "Terms of Service — VeloceMart",
  description: TERMS_OF_SERVICE.intro,
};

export default function TermsOfServicePage() {
  return (
    <div className="animate-fade-in">
      <PageHero
        eyebrow="Legal"
        title={TERMS_OF_SERVICE.title}
        description={TERMS_OF_SERVICE.intro}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Terms of Service" },
        ]}
        meta={
          <p className="text-sm text-text-muted">
            Last updated{" "}
            <time dateTime="2026-10-13" className="font-medium text-text-secondary">
              {TERMS_OF_SERVICE.lastUpdated}
            </time>
          </p>
        }
      />

      <LegalPage document={TERMS_OF_SERVICE} />

      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24">
        <div className="lg:pl-[calc(16rem+3rem)] xl:pl-[calc(16rem+4rem)]">
          <SupportCta
            title="Need to clarify something?"
            description="If anything in these terms is unclear, contact support and we will help."
          >
            <p className="text-xs text-text-muted">
              See also our{" "}
              <Link href="/privacy" className="font-medium text-accent-strong hover:underline">
                Privacy Policy
              </Link>{" "}
              and{" "}
              <Link href="/help" className="font-medium text-accent-strong hover:underline">
                Help Center
              </Link>
              .
            </p>
          </SupportCta>
        </div>
      </div>
    </div>
  );
}
