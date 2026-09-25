import type { Metadata } from "next";
import CategoryLanding from "@/components/category/CategoryLanding";

export const metadata: Metadata = {
  title: "Men — VeloceMart",
  description:
    "Shop men's clothing, footwear, sport and accessories. Premium essentials engineered for every day.",
};

export const revalidate = 0;

export default function MenPage() {
  return <CategoryLanding gender="men" />;
}
