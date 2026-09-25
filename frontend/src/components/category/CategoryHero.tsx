import { GENDER_META, type GenderSlug } from "@/lib/navigation";
import ScrollLink from "./ScrollLink";

const HERO_COPY: Record<GenderSlug, { eyebrow: string; title: string; sub: string }> = {
  men: {
    eyebrow: "VeloceMart Men",
    title: "Engineered for Every Day",
    sub: "Premium essentials built to move with you — from first light to the last set.",
  },
  women: {
    eyebrow: "VeloceMart Women",
    title: "Poise in Motion",
    sub: "Refined silhouettes and everyday icons, made for however you move.",
  },
  kids: {
    eyebrow: "VeloceMart Kids",
    title: "Small Legends, Big Energy",
    sub: "Play-proof gear for every adventure, sized just right.",
  },
};

export default function CategoryHero({ gender }: { gender: GenderSlug }) {
  const copy = HERO_COPY[gender];
  const meta = GENDER_META[gender];

  return (
    <section className="relative overflow-hidden" aria-labelledby={`hero-${gender}-title`}>
      <div className="absolute inset-0">
        <img
          src={`https://picsum.photos/seed/veloce-${gender}-hero/1920/800`}
          alt=""
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/75 to-background/20" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </div>
      <div className="relative mx-auto flex max-w-7xl flex-col items-start gap-4 px-4 py-20 text-start sm:px-6 sm:py-28 lg:px-8 lg:py-36">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-text-muted">
          {copy.eyebrow}
        </p>
        <h1
          id={`hero-${gender}-title`}
          className="max-w-xl text-4xl font-bold tracking-tight text-text-primary sm:text-5xl lg:text-6xl"
        >
          {copy.title}
        </h1>
        <p className="max-w-lg text-base text-text-secondary sm:text-lg">{copy.sub}</p>
        <div className="mt-4 flex flex-wrap items-center gap-6">
          <ScrollLink
            target="shop"
            ariaLabel={`Shop ${meta.label} products`}
            className="inline-flex items-center rounded-lg bg-accent-primary px-6 py-3 text-sm font-semibold text-on-accent transition-all duration-150 hover:bg-accent-primary/90 hover:shadow-glow-accent"
          >
            Shop {meta.label}
          </ScrollLink>
          <ScrollLink
            target="collections"
            ariaLabel="Explore featured categories"
            className="text-sm font-medium text-text-secondary underline decoration-border decoration-2 underline-offset-8 transition-colors duration-150 hover:text-text-primary"
          >
            Explore categories
          </ScrollLink>
        </div>
      </div>
    </section>
  );
}
