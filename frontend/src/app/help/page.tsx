import type { Metadata } from "next";
import HelpExplorer from "@/components/help/HelpExplorer";

export const metadata: Metadata = {
  title: "Help Center — VeloceMart",
  description:
    "Find answers about your VeloceMart account, shopping, cart and checkout, orders, privacy, and contacting support.",
};

export default function HelpPage() {
  return <HelpExplorer />;
}
