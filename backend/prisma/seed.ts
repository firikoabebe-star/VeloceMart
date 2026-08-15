import 'dotenv/config';
import { PrismaClient, Prisma } from '../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

/* ── Category tree (slug → display name) ───────────────────── */
/* Mirrors the storefront navbar / mega-menu structure.         */

const CATEGORIES: Record<string, string> = {
  // Men
  men: 'Men',
  'men-tops': "Men's Tops",
  'men-hoodies': "Men's Hoodies & Sweatshirts",
  'men-jackets': "Men's Jackets",
  'men-pants': "Men's Pants & Joggers",
  'men-shorts': "Men's Shorts",
  'men-sneakers': "Men's Sneakers",
  'men-boots': "Men's Boots",
  'men-sandals': "Men's Sandals",
  'men-watches': "Men's Watches",
  'men-bags': "Men's Bags",
  'men-hats': "Men's Hats",
  'men-accessories': "Men's Accessories",
  // Women
  women: 'Women',
  'women-dresses': "Women's Dresses & Jumpsuits",
  'women-tops': "Women's Tops",
  'women-jackets': "Women's Jackets",
  'women-pants': "Women's Pants",
  'women-skirts': "Women's Skirts",
  'women-heels': "Women's Heels",
  'women-flats': "Women's Flats",
  'women-sneakers': "Women's Sneakers",
  'women-boots': "Women's Boots",
  'women-jewelry': "Women's Jewelry",
  'women-handbags': "Women's Handbags",
  'women-scarves': "Women's Scarves",
  'women-sunglasses': "Women's Sunglasses",
  // Accessories
  accessories: 'Accessories',
  'accessories-backpacks': 'Backpacks',
  'accessories-crossbody': 'Crossbody Bags',
  'accessories-totes': 'Tote Bags',
  'accessories-luggage': 'Luggage',
  'accessories-phone-cases': 'Phone Cases',
  'accessories-watch-bands': 'Watch Bands',
  'accessories-headphone-cases': 'Headphone Cases',
  'accessories-wallets': 'Wallets & Cardholders',
  'accessories-keychains': 'Keychains',
  'accessories-bottles': 'Water Bottles',
};

/* ── Products per category (name, price in cents) ──────────── */

type ProductSeed = [name: string, priceCents: number];

const PRODUCTS: Record<string, ProductSeed[]> = {
  men: [
    ['Aero Everyday Crewneck', 5999],
    ['Stratos Signature Tee', 3499],
  ],
  'men-tops': [
    ['Essential Cotton Tee', 2999],
    ['Meridian Performance Polo', 5499],
  ],
  'men-hoodies': [
    ['Onyx Pullover Hoodie', 7999],
    ['Velocity Zip-Up Sweatshirt', 6999],
  ],
  'men-jackets': [
    ['Apex Windbreaker Jacket', 8999],
    ['Summit Water-Resistant Parka', 14999],
  ],
  'men-pants': [
    ['FlexFit Jogger Pants', 6499],
    ['Command Chino Pants', 7499],
  ],
  'men-shorts': [
    ['Aero Training Shorts', 3999],
    ['Coastline Casual Shorts', 4499],
  ],
  'men-sneakers': [
    ['Velocity Runner Sneakers', 11999],
    ['Stride Court Trainers', 10999],
  ],
  'men-boots': [
    ['Ridge Leather Boots', 15999],
    ['Trailhead Hiking Boots', 13999],
  ],
  'men-sandals': [
    ['Breeze Slide Sandals', 4999],
    ['Shore Strap Sandals', 5499],
  ],
  'men-watches': [
    ['Chrono Steel Watch', 19999],
    ['Minimalist Mesh Watch', 12999],
  ],
  'men-bags': [
    ['Metro Duffle Bag', 11999],
    ['Commuter Laptop Backpack', 8999],
  ],
  'men-hats': [
    ['Aero Snapback Cap', 2499],
    ['Everyday Cotton Cap', 2299],
  ],
  'men-accessories': [
    ['Horizon Leather Belt', 3999],
    ['Stride Sock 3-Pack', 1999],
  ],
  women: [
    ['Meridian Wrap Dress', 8999],
    ['Solstice Linen Blouse', 6499],
  ],
  'women-dresses': [
    ['Serene Maxi Dress', 9999],
    ['Lumen Wrap Dress', 7999],
  ],
  'women-tops': [
    ['Essence Silk Blouse', 6999],
    ['Aria Fitted Tee', 3299],
  ],
  'women-jackets': [
    ['Vela Cropped Jacket', 9499],
    ['Aurora Trench Coat', 16999],
  ],
  'women-pants': [
    ['Grace High-Rise Trousers', 7499],
    ['Flow Wide-Leg Pants', 6999],
  ],
  'women-skirts': [
    ['Halo Pleated Skirt', 5999],
    ['Muse Midi Skirt', 6499],
  ],
  'women-heels': [
    ['Nova Stiletto Heels', 12999],
    ['Claire Block Heels', 9999],
  ],
  'women-flats': [
    ['Luna Ballet Flats', 7999],
    ['Eclipse Loafers', 8999],
  ],
  'women-sneakers': [
    ['Swift Court Sneakers', 9999],
    ['Rosa Retro Runners', 8999],
  ],
  'women-boots': [
    ['Aurora Ankle Boots', 14999],
    ['Haven Knee-High Boots', 18999],
  ],
  'women-jewelry': [
    ['Lumen Gold Necklace', 5999],
    ['Orbit Hoop Earrings', 4499],
  ],
  'women-handbags': [
    ['Saffron Leather Tote', 17999],
    ['Vera Crossbody Bag', 11999],
  ],
  'women-scarves': [
    ['Silken Wrap Scarf', 4999],
    ['Winter Wool Scarf', 3999],
  ],
  'women-sunglasses': [
    ['Aviator Gold Sunglasses', 8999],
    ['Cat-Eye Sunglasses', 7999],
  ],
  accessories: [
    ['Metro Weekender Bag', 13999],
    ['Sonic Travel Pouch', 2999],
  ],
  'accessories-backpacks': [
    ['Apex 25L Backpack', 9999],
    ['Trail 18L Backpack', 8499],
  ],
  'accessories-crossbody': [
    ['Nomad Crossbody Bag', 5999],
    ['Cipher Sling Bag', 4999],
  ],
  'accessories-totes': [
    ['Studio Canvas Tote', 5499],
    ['Market Leather Tote', 12999],
  ],
  'accessories-luggage': [
    ['Voyager Carry-On', 22999],
    ['Atlas Checked Suitcase', 29999],
  ],
  'accessories-phone-cases': [
    ['Aero Snap Phone Case', 2499],
    ['Shield MagSafe Case', 3499],
  ],
  'accessories-watch-bands': [
    ['Sport Silicone Band', 2999],
    ['Classic Leather Band', 4499],
  ],
  'accessories-headphone-cases': [
    ['Pulse Headphone Case', 1999],
    ['Studio Hard Case', 2499],
  ],
  'accessories-wallets': [
    ['Slim Leather Wallet', 4999],
    ['Zippered Cardholder', 3999],
  ],
  'accessories-keychains': [
    ['Orbit Keychain', 1499],
    ['Leather Tag Keychain', 1999],
  ],
  'accessories-bottles': [
    ['Hydra Steel Bottle 750ml', 3499],
    ['Alpine Insulated Bottle', 3999],
  ],
};

/* Categories that carry apparel sizing */
const SIZED_CATEGORIES = new Set([
  'men-tops',
  'men-hoodies',
  'men-jackets',
  'men-pants',
  'men-shorts',
  'men-sneakers',
  'men-boots',
  'men-sandals',
  'men-hats',
  'women-dresses',
  'women-tops',
  'women-jackets',
  'women-pants',
  'women-skirts',
  'women-heels',
  'women-flats',
  'women-sneakers',
  'women-boots',
  'women-scarves',
]);

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function variantsFor(categorySlug: string, productSlug: string, basePrice: number) {
  const sized = SIZED_CATEGORIES.has(categorySlug);
  const sizes: (string | null)[] = sized ? ['S', 'M', 'L'] : [null, null];
  const colors = ['Black', 'White'];

  return sizes.map((size, i) => ({
    sku: `${productSlug.replace(/-/g, '').toUpperCase()}-${i + 1}`,
    name: size ? `${size} / ${colors[i % 2]}` : `Standard / ${colors[i % 2]}`,
    size,
    color: colors[i % 2],
    price: new Prisma.Decimal(basePrice + i * 300),
    stock: 8 + i * 4,
  }));
}

function describe(name: string, categoryName: string): string {
  return `${name} — a standout piece from our ${categoryName} edit. Crafted for everyday versatility, it pairs premium materials with a clean, modern silhouette that works as hard as you do.`;
}

async function main() {
  console.log('Seeding categories…');

  for (const [slug, name] of Object.entries(CATEGORIES)) {
    await prisma.category.upsert({
      where: { slug },
      update: { name },
      create: { slug, name },
    });
  }

  const categories = await prisma.category.findMany();
  const categoryIdBySlug = new Map(
    categories.map((c) => [c.slug, c.id] as const),
  );

  console.log('Seeding products…');

  let created = 0;
  for (const [categorySlug, items] of Object.entries(PRODUCTS)) {
    const categoryId = categoryIdBySlug.get(categorySlug);
    if (!categoryId) continue;

    for (const [index, [name, price]] of items.entries()) {
      const slug = slugify(name);
      const categoryName = CATEGORIES[categorySlug];

      await prisma.product.upsert({
        where: { slug },
        update: {},
        create: {
          name,
          slug,
          description: describe(name, categoryName),
          imageUrl: `https://picsum.photos/seed/${slug}/600/450`,
          categoryId,
          isOnSale: index % 3 === 0,
          variants: { create: variantsFor(categorySlug, slug, price) },
        },
      });
      created += 1;
    }
  }

  console.log(`Done. ${Object.keys(CATEGORIES).length} categories, ${created} products.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
