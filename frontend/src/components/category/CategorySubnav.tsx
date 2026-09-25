"use client";

import Link from "next/link";
import { GENDER_META, getCategoryGroups, type GenderSlug } from "@/lib/navigation";
import { useLanding } from "./landing-context";

const PILL_BASE =
  "whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-strong";
const PILL_ACTIVE = "bg-accent-primary text-on-accent shadow-elevation-1";
const PILL_IDLE = "text-text-secondary hover:bg-surface hover:text-text-primary";

export default function CategorySubnav({ gender }: { gender: GenderSlug }) {
  const meta = GENDER_META[gender];
  const groups = getCategoryGroups(gender);
  const { activeGroup, setActiveGroup } = useLanding();

  const goToShop = (label: string) => {
    setActiveGroup(label);
    document
      .getElementById("shop")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.replaceState(null, "", `#shop`);
  };

  return (
    <div className="sticky top-16 z-30 border-b border-border/60 bg-background/90 backdrop-blur-lg">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        <span className="shrink-0 text-lg font-bold tracking-tight text-text-primary">
          {meta.label}
        </span>
        <span aria-hidden="true" className="hidden h-6 w-px shrink-0 bg-border sm:block" />
        <nav
          aria-label={`${meta.label} categories`}
          className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {groups.map((group) => {
            const isActive = activeGroup === group.label;
            return (
              <button
                key={group.label}
                type="button"
                onClick={() => goToShop(group.label)}
                aria-current={isActive ? "true" : undefined}
                className={`${PILL_BASE} ${isActive ? PILL_ACTIVE : PILL_IDLE}`}
              >
                {group.label}
              </button>
            );
          })}
          <a href="#collections" className={`${PILL_BASE} ${PILL_IDLE}`}>
            Collections
          </a>
        </nav>
        <Link
          href={meta.categoryHref}
          className="hidden shrink-0 text-sm font-medium text-accent-strong transition-opacity duration-150 hover:opacity-80 md:block"
        >
          All {meta.label}
        </Link>
      </div>
    </div>
  );
}
