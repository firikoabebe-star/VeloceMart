"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const client_js_1 = require("../generated/prisma/client.js");
const adapter_pg_1 = require("@prisma/adapter-pg");
const adapter = new adapter_pg_1.PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new client_js_1.PrismaClient({ adapter });
const CATEGORIES = {
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
    kids: 'Kids',
    'kids-teens': 'Teens (13 - 17 years)',
    'kids-big-kids': 'Older Kids (7 - 12 years)',
    'kids-little-kids': 'Younger Kids (3 - 7 years)',
    'kids-baby-toddler': 'Baby & Toddler (0 - 3 years)',
    'kids-tops': "Kids' Tops & Tees",
    'kids-hoodies': "Kids' Hoodies & Sweatshirts",
    'kids-jackets': "Kids' Jackets",
    'kids-pants': "Kids' Pants & Joggers",
    'kids-shorts': "Kids' Shorts",
    'kids-sneakers': "Kids' Sneakers",
    'kids-boots': "Kids' Boots",
    'kids-sandals': "Kids' Sandals",
    'men-running': "Men's Running",
    'men-football': "Men's Football",
    'men-basketball': "Men's Basketball",
    'men-physical-education': "Men's Physical Education",
    'men-skateboarding': "Men's Skateboarding",
    'women-running': "Women's Running",
    'women-football': "Women's Football",
    'women-basketball': "Women's Basketball",
    'women-physical-education': "Women's Physical Education",
    'women-skateboarding': "Women's Skateboarding",
    'kids-running': "Kids' Running",
    'kids-football': "Kids' Football",
    'kids-basketball': "Kids' Basketball",
    'kids-physical-education': "Kids' Physical Education",
    'kids-skateboarding': "Kids' Skateboarding",
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
const PRODUCTS = {
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
    kids: [
        ['Rocket Playground Crewneck', 3999],
        ['Comet Graphic Tee', 2499],
    ],
    'kids-baby-toddler': [
        ['Snuggle Fleece Onesie', 3499],
        ['First Steps Crib Shoes', 2999],
    ],
    'kids-little-kids': [
        ['Playday Cotton Tee', 1999],
        ['Recess Jogger Pants', 3999],
    ],
    'kids-big-kids': [
        ['Varsity Graphic Tee', 2499],
        ['Campus Sport Shorts', 2999],
    ],
    'kids-teens': [
        ['Trendline Graphic Tee', 2499],
        ['Skate Deck Hoodie', 5999],
    ],
    'kids-tops': [
        ['Playground Cotton Tee', 1999],
        ['Junior Performance Polo', 3499],
    ],
    'kids-hoodies': [
        ['Galaxy Pullover Hoodie', 5499],
        ['Sprint Zip-Up Sweatshirt', 4999],
    ],
    'kids-jackets': [
        ['Cloud Puffer Jacket', 7999],
        ['Dash Windbreaker Jacket', 6499],
    ],
    'kids-pants': [
        ['FlexPlay Jogger Pants', 4499],
        ['Campus Chino Pants', 4999],
    ],
    'kids-shorts': [
        ['Dash Mesh Shorts', 2999],
        ['Recess Casual Shorts', 3499],
    ],
    'kids-sneakers': [
        ['Bounce Runner Sneakers', 7499],
        ['Playground Court Trainers', 6999],
    ],
    'kids-boots': [
        ['Scamp Ankle Boots', 8999],
        ['Explorer Hiking Boots', 9999],
    ],
    'kids-sandals': [
        ['Splash Slide Sandals', 3499],
        ['Beachcomber Strap Sandals', 3999],
    ],
    'men-running': [
        ['Tempo Runner Tee', 2999],
        ['Dash Running Shorts', 3499],
    ],
    'men-football': [
        ['Pitch Football Jersey', 5499],
        ['Strike Training Pants', 6499],
    ],
    'men-basketball': [
        ['Court Basketball Jersey', 5999],
        ['Rebound Mesh Shorts', 4999],
    ],
    'men-physical-education': [
        ['Gym Class Crew Tee', 2499],
        ['Coach Track Pants', 4499],
    ],
    'men-skateboarding': [
        ['Ollie Skate Tee', 2799],
        ['Grind Cargo Pants', 5999],
    ],
    'women-running': [
        ['Pace Running Tank', 2699],
        ['Stride Running Leggings', 5499],
    ],
    'women-football': [
        ['Match Football Jersey', 5499],
        ['Dribble Training Shorts', 4499],
    ],
    'women-basketball': [
        ['Hoop Basketball Jersey', 5699],
        ['Fast Break Shorts', 4799],
    ],
    'women-physical-education': [
        ['PE Class Racerback Tee', 2599],
        ['Laps Track Shorts', 3999],
    ],
    'women-skateboarding': [
        ['Kickflip Skate Tee', 2699],
        ['Bowl Skater Pants', 5899],
    ],
    'kids-running': [
        ['Junior Dash Tee', 1999],
        ['Playground Run Shorts', 2499],
    ],
    'kids-football': [
        ['Mini Pitch Jersey', 3499],
        ['Junior Goalie Shorts', 2999],
    ],
    'kids-basketball': [
        ['Little Hoops Jersey', 3499],
        ['Recess Court Shorts', 2699],
    ],
    'kids-physical-education': [
        ['Gym Day Tee', 1899],
        ['Classroom Track Pants', 3299],
    ],
    'kids-skateboarding': [
        ['Grom Skate Tee', 2199],
        ['Board Park Shorts', 2899],
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
    'kids-tops',
    'kids-hoodies',
    'kids-jackets',
    'kids-pants',
    'kids-shorts',
    'kids-sneakers',
    'kids-boots',
    'kids-sandals',
    'kids-teens',
    'kids-little-kids',
    'kids-big-kids',
    'men-running',
    'men-football',
    'men-basketball',
    'men-physical-education',
    'men-skateboarding',
    'women-running',
    'women-football',
    'women-basketball',
    'women-physical-education',
    'women-skateboarding',
    'kids-running',
    'kids-football',
    'kids-basketball',
    'kids-physical-education',
    'kids-skateboarding',
]);
function slugify(text) {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}
function variantsFor(categorySlug, productSlug, basePrice) {
    const sized = SIZED_CATEGORIES.has(categorySlug);
    const sizes = sized ? ['S', 'M', 'L'] : [null, null];
    const colors = ['Black', 'White'];
    return sizes.map((size, i) => ({
        sku: `${productSlug.replace(/-/g, '').toUpperCase()}-${i + 1}`,
        name: size ? `${size} / ${colors[i % 2]}` : `Standard / ${colors[i % 2]}`,
        size,
        color: colors[i % 2],
        price: new client_js_1.Prisma.Decimal(basePrice + i * 300),
        stock: 8 + i * 4,
    }));
}
function describe(name, categoryName) {
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
    const categoryIdBySlug = new Map(categories.map((c) => [c.slug, c.id]));
    console.log('Seeding products…');
    let created = 0;
    for (const [categorySlug, items] of Object.entries(PRODUCTS)) {
        const categoryId = categoryIdBySlug.get(categorySlug);
        if (!categoryId)
            continue;
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
//# sourceMappingURL=seed.js.map