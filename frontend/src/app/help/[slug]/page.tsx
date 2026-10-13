import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/informational/PageHero";
import {
  HELP_ARTICLES,
  getHelpArticle,
  getHelpCategory,
} from "@/lib/help";

interface HelpArticlePageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return HELP_ARTICLES.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({
  params,
}: HelpArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getHelpArticle(slug);
  if (!article) return { title: "Help article — VeloceMart" };
  return {
    title: `${article.title} — VeloceMart Help`,
    description: article.summary,
  };
}

export default async function HelpArticlePage({ params }: HelpArticlePageProps) {
  const { slug } = await params;
  const article = getHelpArticle(slug);
  if (!article) notFound();

  const category = getHelpCategory(article.categoryId);

  return (
    <div className="animate-fade-in">
      <PageHero
        eyebrow={category?.title ?? "Help"}
        title={article.title}
        description={article.summary}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Help Center", href: "/help" },
          { label: article.title },
        ]}
      />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-12">
          <article className="min-w-0 max-w-3xl">
            <div className="space-y-8">
              {article.sections.map((section) => (
                <section key={section.heading}>
                  <h2 className="text-lg font-semibold text-text-primary sm:text-xl">
                    {section.heading}
                  </h2>
                  {section.paragraphs?.map((paragraph) => (
                    <p
                      key={paragraph}
                      className="mt-3 text-[15px] leading-relaxed text-text-secondary"
                    >
                      {paragraph}
                    </p>
                  ))}
                  {section.steps && (
                    <ol className="mt-4 space-y-3">
                      {section.steps.map((step, index) => (
                        <li key={step} className="flex gap-3">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-tertiary text-xs font-semibold text-accent-primary">
                            {index + 1}
                          </span>
                          <span className="text-[15px] leading-relaxed text-text-secondary">
                            {step}
                          </span>
                        </li>
                      ))}
                    </ol>
                  )}
                  {section.list && (
                    <ul className="mt-4 space-y-2.5">
                      {section.list.map((item) => (
                        <li
                          key={item}
                          className="flex gap-3 text-[15px] leading-relaxed text-text-secondary"
                        >
                          <span
                            aria-hidden="true"
                            className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-primary"
                          />
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}
            </div>

            <div className="mt-10 border-t border-border/40 pt-6">
              <Link
                href="/help"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-accent-strong hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-strong"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                Back to Help Center
              </Link>
            </div>
          </article>

          <aside className="mt-10 lg:mt-0">
            <div className="lg:sticky lg:top-24">
              {article.related && article.related.length > 0 && (
                <div className="rounded-2xl border border-border/50 bg-surface p-5">
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-text-muted">
                    Related
                  </h2>
                  <ul className="mt-4 space-y-3">
                    {article.related.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="group inline-flex items-start gap-1.5 text-sm text-text-secondary transition-colors hover:text-accent-strong"
                        >
                          <span>{link.label}</span>
                          <svg
                            className="mt-0.5 h-3.5 w-3.5 shrink-0 opacity-0 transition-all duration-150 group-hover:translate-x-0.5 group-hover:opacity-100"
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
              )}
              <div className="mt-6 rounded-2xl border border-border/50 bg-surface-tertiary/40 p-5">
                <h2 className="text-sm font-semibold text-text-primary">
                  Need more help?
                </h2>
                <p className="mt-1.5 text-sm text-text-secondary">
                  Contact support and we will reply by email.
                </p>
                <Link
                  href="/contact"
                  className="mt-4 inline-flex items-center justify-center rounded-lg bg-accent-primary px-4 py-2 text-sm font-semibold text-on-accent transition-colors hover:bg-accent-primary/90"
                >
                  Contact support
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
