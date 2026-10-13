import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/informational/PageHero";
import { SupportCta } from "@/components/informational/SupportCta";
import { LegalPage } from "@/components/legal/LegalPage";
import { PRIVACY_POLICY } from "@/lib/legal/privacy";

export const metadata: Metadata = {
  title: "Privacy Policy — VeloceMart",
  description: PRIVACY_POLICY.intro,
};

export default function PrivacyPolicyPage() {
  return (
    <div className="animate-fade-in">
      <PageHero
        eyebrow="Legal"
        title={PRIVACY_POLICY.title}
        description={PRIVACY_POLICY.intro}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Privacy Policy" },
        ]}
        meta={
          <p className="text-sm text-text-muted">
            Last updated{" "}
            <time dateTime="2026-10-13" className="font-medium text-text-secondary">
              {PRIVACY_POLICY.lastUpdated}
            </time>
          </p>
        }
      />

      <LegalPage document={PRIVACY_POLICY} />

      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24">
        <div className="lg:pl-[calc(16rem+3rem)] xl:pl-[calc(16rem+4rem)]">
          <SupportCta
            title="Questions about your privacy?"
            description="Use the contact form to ask about your data or to request access or deletion."
          >
            <p className="text-xs text-text-muted">
              See also our{" "}
              <Link href="/terms" className="font-medium text-accent-strong hover:underline">
                Terms of Service
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
