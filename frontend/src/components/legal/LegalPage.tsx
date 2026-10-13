"use client";

import { useEffect, useRef, useState } from "react";
import type { LegalDocument } from "@/lib/legal/types";

/** Thin reading-progress bar fixed under the header. Purely decorative. */
function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - doc.clientHeight;
      setProgress(scrollable > 0 ? Math.min(1, Math.max(0, doc.scrollTop / scrollable)) : 0);
    };
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-x-0 top-16 z-30 h-0.5 bg-transparent"
    >
      <div
        className="h-full origin-left bg-accent-primary transition-[width] duration-150 ease-out"
        style={{ width: `${progress * 100}%` }}
      />
    </div>
  );
}

interface LegalPageProps {
  document: LegalDocument;
}

/**
 * Owner-review notes are internal review flags, not customer-facing policy.
 * They are shown only in development so the owner can act on them before
 * publication; in production builds `process.env.NODE_ENV` is inlined to
 * "production", so the callouts are dead-code-eliminated and never shipped.
 */
const showOwnerReviewNotes = process.env.NODE_ENV !== "production";

/**
 * Accessible legal-document layout: a sticky, numbered table of contents beside
 * readable content, with anchor links, an active-section highlight, and a
 * subtle reading-progress indicator.
 */
export function LegalPage({ document }: LegalPageProps) {
  const [activeId, setActiveId] = useState<string>(document.sections[0]?.id ?? "");
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) =>
              a.target.getBoundingClientRect().top -
              b.target.getBoundingClientRect().top,
          );
        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-96px 0px -70% 0px", threshold: 0 },
    );

    for (const el of sectionRefs.current.values()) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const registerSection = (id: string, el: HTMLElement | null) => {
    if (el) sectionRefs.current.set(id, el);
    else sectionRefs.current.delete(id);
  };

  return (
    <>
      <ReadingProgress />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="lg:grid lg:grid-cols-[minmax(0,16rem)_minmax(0,1fr)] lg:gap-12 xl:gap-16">
          {/* Table of contents */}
          <aside className="mb-10 lg:mb-0">
            <nav
              aria-label="Table of contents"
              className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto lg:pr-2"
            >
              <h2 className="text-xs font-semibold uppercase tracking-widest text-text-muted">
                On this page
              </h2>
              <ol className="mt-4 space-y-1 border-l border-border/50">
                {document.sections.map((section, index) => {
                  const isActive = activeId === section.id;
                  return (
                    <li key={section.id}>
                      <a
                        href={`#${section.id}`}
                        aria-current={isActive ? "true" : undefined}
                        className={`-ml-px flex gap-2 border-l py-1.5 pl-4 pr-2 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-strong ${
                          isActive
                            ? "border-accent-primary font-medium text-accent-strong"
                            : "border-transparent text-text-secondary hover:border-border-light hover:text-text-primary"
                        }`}
                      >
                        <span className="tabular-nums text-text-muted">
                          {index + 1}.
                        </span>
                        <span>{section.title}</span>
                      </a>
                    </li>
                  );
                })}
              </ol>
            </nav>
          </aside>

          {/* Document body */}
          <article className="min-w-0 max-w-3xl">
            <div className="space-y-10">
              {document.sections.map((section, index) => (
                <section
                  key={section.id}
                  id={section.id}
                  ref={(el) => registerSection(section.id, el)}
                  className="scroll-mt-24"
                >
                  <h2 className="flex scroll-mt-24 items-baseline gap-3 text-xl font-semibold tracking-tight text-text-primary sm:text-2xl">
                    <span className="tabular-nums text-accent-strong">
                      {index + 1}.
                    </span>
                    {section.title}
                  </h2>

                  {section.paragraphs?.map((paragraph) => (
                    <p
                      key={paragraph}
                      className="mt-4 text-[15px] leading-relaxed text-text-secondary"
                    >
                      {paragraph}
                    </p>
                  ))}

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

                  {section.subsections?.map((sub) => (
                    <div key={sub.title} className="mt-6">
                      <h3 className="text-base font-semibold text-text-primary">
                        {sub.title}
                      </h3>
                      {sub.paragraphs?.map((paragraph) => (
                        <p
                          key={paragraph}
                          className="mt-3 text-[15px] leading-relaxed text-text-secondary"
                        >
                          {paragraph}
                        </p>
                      ))}
                      {sub.list && (
                        <ul className="mt-3 space-y-2.5">
                          {sub.list.map((item) => (
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
                    </div>
                  ))}

                  {showOwnerReviewNotes && section.ownerReview && (
                    <div className="mt-5 flex gap-3 rounded-xl border border-warning/30 bg-warning/10 p-4">
                      <svg
                        className="h-5 w-5 shrink-0 text-warning"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                        />
                      </svg>
                      <div>
                        <p className="text-sm font-semibold text-warning">
                          Owner review required
                        </p>
                        <p className="mt-1 text-sm leading-relaxed text-text-secondary">
                          {section.ownerReview}
                        </p>
                      </div>
                    </div>
                  )}
                </section>
              ))}
            </div>
          </article>
        </div>
      </div>
    </>
  );
}
