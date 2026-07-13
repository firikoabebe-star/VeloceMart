"use client";

import { useState } from "react";

/* ── Data ─────────────────────────────────────────────────── */
const footerLinks = {
  shop: {
    heading: "Shop",
    links: [
      { label: "Men's Collection", href: "/category/men" },
      { label: "Women's Collection", href: "/category/women" },
      { label: "Accessories", href: "/category/accessories" },
      { label: "New Arrivals", href: "/collections/new" },
      { label: "Best Sellers", href: "/collections/bestsellers" },
      { label: "Sale", href: "/sale" },
    ],
  },
  customerService: {
    heading: "Customer Service",
    links: [
      { label: "Help Center", href: "/help" },
      { label: "Order Tracking", href: "/orders/track" },
      { label: "Shipping & Delivery", href: "/help/shipping" },
      { label: "Returns & Exchanges", href: "/help/returns" },
      { label: "Size Guide", href: "/help/size-guide" },
      { label: "Contact Us", href: "/contact" },
    ],
  },
  company: {
    heading: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Press", href: "/press" },
      { label: "Sustainability", href: "/sustainability" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
};

const socialLinks = [
  {
    label: "Instagram",
    href: "https://instagram.com",
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 016.11 2.525c.636-.247 1.363-.416 2.427-.465C8.88 2.013 9.235 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
      </svg>
    ),
  },
  {
    label: "Twitter / X",
    href: "https://x.com",
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "https://youtube.com",
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    label: "Pinterest",
    href: "https://pinterest.com",
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.782c0-1.67.968-2.914 2.172-2.914 1.027 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146 1.124.347 2.317.535 3.554.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z" />
      </svg>
    ),
  },
  {
    label: "TikTok",
    href: "https://tiktok.com",
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
      </svg>
    ),
  },
];

const paymentIcons = [
  { label: "Visa", icon: "V" },
  { label: "Mastercard", icon: "M" },
  { label: "Amex", icon: "A" },
  { label: "PayPal", icon: "P" },
  { label: "Apple Pay", icon: "AP" },
];

/* ── Component ────────────────────────────────────────────── */
export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail("");
    setTimeout(() => setSubscribed(false), 3000);
  };

  return (
    <footer className="border-t border-border/20 bg-background">
      {/* Newsletter Section */}
      <div className="border-b border-border/20 bg-surface/50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex w-full flex-col items-center justify-between gap-6 sm:flex-row">
            <div>
              <h3 className="text-lg font-semibold text-text-primary">
                Join the Veloce Community
              </h3>
              <p className="mt-1 text-sm text-text-secondary">
                Be the first to know about new arrivals, exclusive drops, and member-only offers.
              </p>
            </div>
            <form
              onSubmit={handleNewsletterSubmit}
              className="relative flex w-full max-w-md flex-col gap-2"
            >
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-text-primary placeholder-text-muted transition-all duration-200 focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20"
                />
                <button
                  type="submit"
                  className="shrink-0 rounded-lg bg-accent-primary px-5 py-2.5 text-sm font-semibold text-background transition-all duration-150 hover:bg-accent-primary/90 hover:shadow-glow-accent"
                >
                  Subscribe
                </button>
              </div>
              {subscribed && (
                <p className="absolute -bottom-7 left-0 text-sm text-success">
                  ✓ Thanks for subscribing!
                </p>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer Columns */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <a href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-primary">
                <span className="text-sm font-bold text-background">V</span>
              </div>
              <span className="text-lg font-bold tracking-tight text-text-primary">
                Veloce<span className="text-accent-primary">Mart</span>
              </span>
            </a>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-text-secondary">
              Premium fashion and accessories for the modern individual. Curated collections
              designed to elevate your everyday style.
            </p>

            {/* Social Links */}
            <div className="mt-6 flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/40 text-text-muted transition-all duration-150 hover:border-accent-primary/40 hover:bg-accent-primary/10 hover:text-accent-primary"
                >
                  {social.icon}
                </a>
              ))}
            </div>

            {/* Trust badge */}
            <div className="mt-6">
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-text-muted">
                We Accept
              </p>
              <div className="flex flex-wrap gap-2">
                {paymentIcons.map((pm) => (
                  <span
                    key={pm.label}
                    className="flex h-8 w-10 items-center justify-center rounded-md border border-border/30 bg-surface text-[10px] font-bold tracking-tight text-text-muted"
                    title={pm.label}
                  >
                    {pm.icon}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Link Columns */}
          {Object.values(footerLinks).map((col) => (
            <div key={col.heading}>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-text-muted">
                {col.heading}
              </h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-text-secondary transition-colors duration-150 hover:text-accent-primary"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border/20">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row sm:px-6 lg:px-8">
          <p className="text-xs text-text-muted">
            &copy; {new Date().getFullYear()} VeloceMart. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="/privacy" className="text-xs text-text-muted transition-colors hover:text-text-secondary">
              Privacy
            </a>
            <a href="/terms" className="text-xs text-text-muted transition-colors hover:text-text-secondary">
              Terms
            </a>
            <a href="/sitemap" className="text-xs text-text-muted transition-colors hover:text-text-secondary">
              Sitemap
            </a>
            <span className="flex items-center gap-1.5 text-xs text-text-muted">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
              </svg>
              English (US)
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
