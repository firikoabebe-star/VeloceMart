import Link from "next/link";
import {
  GENDER_META,
  getCategoryGroups,
  getCollectionLinks,
  type GenderSlug,
} from "@/lib/navigation";

export default function CategoryFooterLinks({ gender }: { gender: GenderSlug }) {
  const meta = GENDER_META[gender];
  const groups = getCategoryGroups(gender);
  const find = (heading: string) =>
    groups.find((g) => g.label === heading)?.items ?? [];

  const columns = [
    {
      heading: `${meta.possessive} Footwear & Sport`,
      links: [...find("Footwear"), ...find("Sport")],
    },
    {
      heading: `${meta.possessive} Clothing`,
      links: find("Clothing"),
    },
    {
      heading: `${meta.possessive} Accessories`,
      links: [...find("Accessories"), ...getCollectionLinks(gender)],
    },
  ];

  return (
    <section aria-label={`More ${meta.label} links`} className="mt-4 border-t border-border/40 bg-surface/40">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {columns.map((col) => (
            <div key={col.heading}>
              <h2 className="text-sm font-semibold uppercase tracking-widest text-text-muted">
                {col.heading}
              </h2>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-text-secondary transition-colors duration-150 hover:text-accent-strong"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
