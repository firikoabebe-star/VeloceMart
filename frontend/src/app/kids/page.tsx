import type { Metadata } from "next";
import CategoryLanding from "@/components/category/CategoryLanding";

export const metadata: Metadata = {
  title: "Kids — VeloceMart",
  description:
    "Shop kids' clothing, footwear and sport gear by age group. Play-proof gear for every adventure.",
};

export const revalidate = 0;

export default function KidsPage() {
  return <CategoryLanding gender="kids" />;
}
