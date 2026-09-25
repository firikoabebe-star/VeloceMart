/* ── Types ────────────────────────────────────────────────── */
export interface MegaLink {
  label: string;
  href: string;
  children?: MegaLink[];
}

export interface MegaColumn {
  heading: string;
  links: MegaLink[];
}

export interface NavCategory {
  label: string;
  href: string;
  megaColumns?: MegaColumn[];
}

export type GenderSlug = "men" | "women" | "kids";

/* ── Data ─────────────────────────────────────────────────── */
const ACCESSORIES_COLUMN: MegaColumn = {
  heading: "Accessories",
  links: [
    {
      label: "Bags",
      href: "/category/accessories",
      children: [
        { label: "Backpacks", href: "/category/accessories/backpacks" },
        { label: "Crossbody Bags", href: "/category/accessories/crossbody" },
        { label: "Tote Bags", href: "/category/accessories/totes" },
        { label: "Luggage", href: "/category/accessories/luggage" },
      ],
    },
    {
      label: "Tech",
      href: "/category/accessories",
      children: [
        { label: "Phone Cases", href: "/category/accessories/phone-cases" },
        { label: "Watch Bands", href: "/category/accessories/watch-bands" },
        { label: "Headphone Cases", href: "/category/accessories/headphone-cases" },
      ],
    },
    {
      label: "Lifestyle",
      href: "/category/accessories",
      children: [
        { label: "Wallets & Cardholders", href: "/category/accessories/wallets" },
        { label: "Watches", href: "/category/men/watches" },
        { label: "Belts", href: "/category/men/accessories" },
        { label: "Hats & Caps", href: "/category/men/hats" },
        { label: "Keychains", href: "/category/accessories/keychains" },
        { label: "Water Bottles", href: "/category/accessories/bottles" },
      ],
    },
  ],
};

const WOMEN_ACCESSORY_LINKS: MegaLink[] = [
  { label: "Jewelry", href: "/category/women/jewelry" },
  { label: "Handbags", href: "/category/women/handbags" },
  { label: "Scarves", href: "/category/women/scarves" },
  { label: "Sunglasses", href: "/category/women/sunglasses" },
];

const KIDS_BY_AGE_COLUMN: MegaColumn = {
  heading: "Kids by Age",
  links: [
    { label: "Teens (13 - 17 years)", href: "/category/kids/teens" },
    { label: "Older Kids (7 - 12 years)", href: "/category/kids/big-kids" },
    { label: "Younger Kids (3 - 7 years)", href: "/category/kids/little-kids" },
    { label: "Baby & Toddler (0 - 3 years)", href: "/category/kids/baby-toddler" },
  ],
};

function sportColumn(gender: GenderSlug): MegaColumn {
  return {
    heading: "Sport",
    links: [
      { label: "Running", href: `/category/${gender}/running` },
      { label: "Football", href: `/category/${gender}/football` },
      { label: "Basketball", href: `/category/${gender}/basketball` },
      { label: "Physical Education", href: `/category/${gender}/physical-education` },
      { label: "Skateboarding", href: `/category/${gender}/skateboarding` },
    ],
  };
}

export const NAV_CATEGORIES: NavCategory[] = [
  {
    label: "Men",
    href: "/men",
    megaColumns: [
      {
        heading: "Clothing",
        links: [
          { label: "Tops & Tees", href: "/category/men/tops" },
          { label: "Hoodies & Sweatshirts", href: "/category/men/hoodies" },
          { label: "Jackets & Coats", href: "/category/men/jackets" },
          { label: "Pants & Joggers", href: "/category/men/pants" },
          { label: "Shorts", href: "/category/men/shorts" },
        ],
      },
      {
        heading: "Footwear",
        links: [
          { label: "Sneakers", href: "/category/men/sneakers" },
          { label: "Boots", href: "/category/men/boots" },
          { label: "Sandals", href: "/category/men/sandals" },
        ],
      },
      sportColumn("men"),
      ACCESSORIES_COLUMN,
      {
        heading: "Collections",
        links: [
          { label: "New Arrivals", href: "/collections/new" },
          { label: "Best Sellers", href: "/collections/bestsellers" },
          { label: "Sale", href: "/sale" },
        ],
      },
    ],
  },
  {
    label: "Women",
    href: "/women",
    megaColumns: [
      {
        heading: "Clothing",
        links: [
          { label: "Dresses & Jumpsuits", href: "/category/women/dresses" },
          { label: "Tops & Blouses", href: "/category/women/tops" },
          { label: "Jackets & Blazers", href: "/category/women/jackets" },
          { label: "Pants & Leggings", href: "/category/women/pants" },
          { label: "Skirts & Shorts", href: "/category/women/skirts" },
        ],
      },
      {
        heading: "Footwear",
        links: [
          { label: "Heels & Platforms", href: "/category/women/heels" },
          { label: "Flats & Loafers", href: "/category/women/flats" },
          { label: "Sneakers", href: "/category/women/sneakers" },
          { label: "Boots", href: "/category/women/boots" },
        ],
      },
      sportColumn("women"),
      {
        heading: "Accessories",
        links: [...ACCESSORIES_COLUMN.links, ...WOMEN_ACCESSORY_LINKS],
      },
      {
        heading: "Collections",
        links: [
          { label: "New Arrivals", href: "/collections/new" },
          { label: "Best Sellers", href: "/collections/bestsellers" },
          { label: "Sale", href: "/sale" },
        ],
      },
    ],
  },
  {
    label: "Kids",
    href: "/kids",
    megaColumns: [
      KIDS_BY_AGE_COLUMN,
      sportColumn("kids"),
      {
        heading: "Clothing",
        links: [
          { label: "Tops & Tees", href: "/category/kids/tops" },
          { label: "Hoodies & Sweatshirts", href: "/category/kids/hoodies" },
          { label: "Jackets & Coats", href: "/category/kids/jackets" },
          { label: "Pants & Joggers", href: "/category/kids/pants" },
          { label: "Shorts", href: "/category/kids/shorts" },
        ],
      },
      {
        heading: "Footwear",
        links: [
          { label: "Sneakers", href: "/category/kids/sneakers" },
          { label: "Boots", href: "/category/kids/boots" },
          { label: "Sandals", href: "/category/kids/sandals" },
        ],
      },
      ACCESSORIES_COLUMN,
      {
        heading: "Collections",
        links: [
          { label: "New Arrivals", href: "/collections/new" },
          { label: "Best Sellers", href: "/collections/bestsellers" },
          { label: "Sale", href: "/sale" },
        ],
      },
    ],
  },
  {
    label: "Sale",
    href: "/sale",
  },
];

/* ── Landing page helpers ─────────────────────────────────── */
export const GENDER_META: Record<
  GenderSlug,
  { label: string; possessive: string; categoryHref: string }
> = {
  men: { label: "Men", possessive: "Men's", categoryHref: "/category/men" },
  women: { label: "Women", possessive: "Women's", categoryHref: "/category/women" },
  kids: { label: "Kids", possessive: "Kids'", categoryHref: "/category/kids" },
};

export function getNavCategory(gender: GenderSlug): NavCategory {
  const cat = NAV_CATEGORIES.find((c) => c.href === `/${gender}`);
  if (!cat) throw new Error(`Unknown gender: ${gender}`);
  return cat;
}

export interface CategoryGroup {
  label: string;
  items: { label: string; href: string }[];
}

/** Category columns for a gender, excluding the Collections column. */
export function getCategoryGroups(gender: GenderSlug): CategoryGroup[] {
  const cols = getNavCategory(gender).megaColumns ?? [];
  return cols
    .filter((col) => col.heading !== "Collections")
    .map((col) => ({
      label: col.heading,
      items: col.links.flatMap((link) => link.children ?? [link]),
    }));
}

/** The Collections column links for a gender (New Arrivals / Best Sellers / Sale). */
export function getCollectionLinks(gender: GenderSlug): { label: string; href: string }[] {
  const col = (getNavCategory(gender).megaColumns ?? []).find(
    (c) => c.heading === "Collections",
  );
  return col?.links.map(({ label, href }) => ({ label, href })) ?? [];
}

/** "/category/men/tops" -> "men-tops" (matches the [...slugs] route convention). */
export function slugFromHref(href: string): string {
  return href
    .replace(/^\/category\//, "")
    .split("/")
    .join("-");
}
