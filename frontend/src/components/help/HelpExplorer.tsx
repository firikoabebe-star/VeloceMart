"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PageHero } from "@/components/informational/PageHero";
import { SupportCta } from "@/components/informational/SupportCta";
import {
  HELP_CATEGORIES,
  HELP_FAQS,
  getArticlesForCategory,
  searchHelp,
  type HelpIconName,
  type HelpSearchResult,
} from "@/lib/help";

function HelpIcon({
  name,
  className = "h-5 w-5",
}: {
  name: HelpIconName;
  className?: string;
}) {
  const common = {
    className,
    fill: "none" as const,
    viewBox: "0 0 24 24",
    stroke: "currentColor",
    strokeWidth: 1.8,
    "aria-hidden": true,
  };
  switch (name) {
    case "sparkles":
      return (
        <svg {...common}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.091zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
        </svg>
      );
    case "lock":
      return (
        <svg {...common}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
        </svg>
      );
    case "shopping-bag":
      return (
        <svg {...common}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
        </svg>
      );
    case "cart":
      return (
        <svg {...common}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
        </svg>
      );
    case "receipt":
      return (
        <svg {...common}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5l-2-1.5L13 21l-2-1.5L9 21l-2-1.5L5 21V5.25A2.25 2.25 0 017.25 3h9.5A2.25 2.25 0 0119 5.25V21z" />
        </svg>
      );
    case "shield":
      return (
        <svg {...common}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
      );
    case "chat":
      return (
        <svg {...common}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
        </svg>
      );
  }
}

function FaqAccordion() {
  const [openId, setOpenId] = useState<string | null>(HELP_FAQS[0]?.id ?? null);

  return (
    <div className="divide-y divide-border/50 overflow-hidden rounded-2xl border border-border/50 bg-surface">
      {HELP_FAQS.map((faq) => {
        const isOpen = openId === faq.id;
        return (
          <div key={faq.id}>
            <h3>
              <button
                type="button"
                id={`${faq.id}-button`}
                aria-expanded={isOpen}
                aria-controls={`${faq.id}-panel`}
                onClick={() => setOpenId(isOpen ? null : faq.id)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-surface-tertiary/50 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent-strong sm:px-6"
              >
                <span className="text-sm font-medium text-text-primary sm:text-base">
                  {faq.question}
                </span>
                <svg
                  className={`h-4 w-4 shrink-0 text-text-muted transition-transform duration-200 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </h3>
            <div
              id={`${faq.id}-panel`}
              role="region"
              aria-labelledby={`${faq.id}-button`}
              hidden={!isOpen}
              className="px-5 pb-5 sm:px-6"
            >
              <p className="max-w-3xl text-sm leading-relaxed text-text-secondary">
                {faq.answer}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SearchResults({
  results,
  query,
  onClear,
}: {
  results: HelpSearchResult[];
  query: string;
  onClear: () => void;
}) {
  if (results.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-surface px-6 py-12 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-surface-tertiary">
          <svg
            className="h-6 w-6 text-text-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.8}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-text-primary">
          No results for &ldquo;{query}&rdquo;
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-text-secondary">
          Try a different keyword, or contact support and we will help you
          directly.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold text-text-primary transition-colors hover:border-accent-primary/60 hover:text-accent-strong"
          >
            Clear search
          </button>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-lg bg-accent-primary px-4 py-2 text-sm font-semibold text-on-accent transition-colors hover:bg-accent-primary/90"
          >
            Contact support
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-text-secondary">
          {results.length} result{results.length !== 1 ? "s" : ""} for{" "}
          <span className="font-medium text-text-primary">
            &ldquo;{query}&rdquo;
          </span>
        </p>
        <button
          type="button"
          onClick={onClear}
          className="rounded text-sm font-medium text-accent-strong transition-colors hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-strong"
        >
          Clear
        </button>
      </div>
      <ul className="space-y-3">
        {results.map((result) => (
          <li key={`${result.type}-${result.href}-${result.title}`}>
            <Link
              href={result.href}
              className="block rounded-xl border border-border/50 bg-surface p-4 transition-all duration-200 hover:border-accent-primary/50 hover:shadow-elevation-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-strong"
            >
              <span className="text-xs font-medium uppercase tracking-wider text-text-muted">
                {result.type === "article" ? "Article" : "FAQ"}
              </span>
              <span className="mt-1 block text-sm font-semibold text-text-primary">
                {result.title}
              </span>
              <span className="mt-1 block text-sm leading-relaxed text-text-secondary line-clamp-2">
                {result.excerpt}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function HelpExplorer() {
  const [query, setQuery] = useState("");
  const trimmed = query.trim();
  const isSearching = trimmed.length > 0;
  const results = useMemo(() => searchHelp(query), [query]);

  return (
    <div className="animate-fade-in">
      <PageHero
        eyebrow="Support"
        title="How can we help?"
        description="Search guides and answers for accounts, shopping, orders, and privacy. Our contact form is always available if you need a hand."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Help Center" }]}
      >
        <div className="relative max-w-xl">
          <label htmlFor="help-search" className="sr-only">
            Search help articles and FAQs
          </label>
          <svg
            className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            id="help-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for an answer…"
            className="w-full rounded-xl border border-border bg-surface py-3 pl-11 pr-11 text-sm text-text-primary placeholder-text-muted shadow-elevation-1 transition-colors focus:border-accent-primary"
            autoComplete="off"
          />
          {query.length > 0 && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-surface-tertiary hover:text-text-primary"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </PageHero>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        {isSearching ? (
          <SearchResults
            results={results}
            query={trimmed}
            onClear={() => setQuery("")}
          />
        ) : (
          <div className="space-y-16">
            {/* Categories */}
            <section aria-labelledby="help-categories">
              <h2
                id="help-categories"
                className="text-xl font-semibold tracking-tight text-text-primary sm:text-2xl"
              >
                Browse by topic
              </h2>
              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {HELP_CATEGORIES.map((category) => {
                  const articles = getArticlesForCategory(category.id);
                  return (
                    <div
                      key={category.id}
                      id={`category-${category.id}`}
                      className="flex scroll-mt-24 flex-col rounded-2xl border border-border/50 bg-surface p-5 transition-all duration-200 hover:border-accent-primary/40 hover:shadow-elevation-1"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-tertiary text-accent-primary">
                        <HelpIcon name={category.icon} />
                      </div>
                      <h3 className="mt-4 text-base font-semibold text-text-primary">
                        {category.title}
                      </h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">
                        {category.description}
                      </p>
                      {articles.length > 0 && (
                        <ul className="mt-4 space-y-2 border-t border-border/40 pt-4">
                          {articles.map((article) => (
                            <li key={article.slug}>
                              <Link
                                href={`/help/${article.slug}`}
                                className="group inline-flex items-center gap-1.5 text-sm text-text-secondary transition-colors hover:text-accent-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-strong"
                              >
                                <span>{article.title}</span>
                                <svg
                                  className="h-3.5 w-3.5 shrink-0 opacity-0 transition-all duration-150 group-hover:translate-x-0.5 group-hover:opacity-100"
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
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* FAQs */}
            <section id="faqs" aria-labelledby="help-faqs" className="scroll-mt-24">
              <h2
                id="help-faqs"
                className="text-xl font-semibold tracking-tight text-text-primary sm:text-2xl"
              >
                Frequently asked questions
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-text-secondary">
                Quick answers to the questions we hear most often.
              </p>
              <div className="mt-6">
                <FaqAccordion />
              </div>
            </section>

            {/* Support CTA */}
            <SupportCta
              title="Can't find what you need?"
              description="Send us a message and we will get back to you by email. Include your order reference if your question is about an order."
            />
          </div>
        )}
      </div>
    </div>
  );
}
