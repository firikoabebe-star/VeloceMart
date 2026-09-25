import {
  GENDER_META,
  getCategoryGroups,
  type GenderSlug,
} from "@/lib/navigation";
import { fetchGroupProducts } from "@/lib/product-groups";
import LandingStateProvider from "./landing-context";
import CategorySubnav from "./CategorySubnav";
import CategoryHero from "./CategoryHero";
import ShopByCategory from "./ShopByCategory";
import ProductGridSection from "./ProductGridSection";
import CategoryFooterLinks from "./CategoryFooterLinks";

export default async function CategoryLanding({ gender }: { gender: GenderSlug }) {
  const meta = GENDER_META[gender];
  const groups = getCategoryGroups(gender);
  const initialProducts = await fetchGroupProducts(groups[0]).catch(() => []);

  return (
    <LandingStateProvider initialGroup={groups[0].label}>
      <CategorySubnav gender={gender} />
      <main>
        <CategoryHero gender={gender} />
        <ShopByCategory gender={gender} />
        <ProductGridSection groups={groups} initialProducts={initialProducts} />
        <CategoryFooterLinks gender={gender} />
      </main>
    </LandingStateProvider>
  );
}
