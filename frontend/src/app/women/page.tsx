import type { Metadata } from "next";
import CategoryLanding from "@/components/category/CategoryLanding";

export const metadata: Metadata = {
  title: "Women — VeloceMart",
  description:
    "Shop women's clothing, footwear, sport and accessories. Refined silhouettes made for however you move.",
};

export const revalidate = 0;

export default function WomenPage() {
  return <CategoryLanding gender="women" />;
}
