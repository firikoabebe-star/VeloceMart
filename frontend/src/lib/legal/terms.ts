import type { LegalDocument } from "./types";

export const TERMS_OF_SERVICE: LegalDocument = {
  title: "Terms of Service",
  intro:
    "These Terms of Service govern your use of the VeloceMart online store. Please read them carefully. By creating an account or using the store, you agree to these terms.",
  lastUpdated: "October 13, 2026",
  sections: [
    {
      id: "acceptance",
      title: "Acceptance of these terms",
      paragraphs: [
        "By accessing the VeloceMart store, creating an account, or placing an order, you agree to be bound by these Terms of Service and by our Privacy Policy. If you do not agree, please do not use the store.",
      ],
    },
    {
      id: "eligibility",
      title: "Eligibility and accounts",
      paragraphs: [
        "You must be able to form a binding contract to create an account and place an order. You agree to provide accurate information and to keep it up to date. You are responsible for the activity that occurs under your account.",
      ],
    },
    {
      id: "account-security",
      title: "Account security",
      paragraphs: [
        "You are responsible for keeping your password confidential. We store passwords using a one-way hash and cannot recover them for you; we provide a password reset flow that sends a one-time code to your registered email address.",
        "If you sign in with Google, you are responsible for the security of your Google account. Please notify us immediately if you believe your VeloceMart account has been accessed without your authorisation.",
      ],
    },
    {
      id: "products",
      title: "Product listings and availability",
      paragraphs: [
        "We aim to describe products accurately, but we do not warrant that descriptions, images, colours, or other content are complete or error-free. Availability and stock are validated when you place an order, and an item may become unavailable while it is in your cart.",
      ],
    },
    {
      id: "cart-checkout",
      title: "Cart and checkout",
      paragraphs: [
        "Adding an item to your cart does not reserve it. Checkout is subject to stock validation at the time the order is created. Cart and checkout require you to be signed in.",
      ],
    },
    {
      id: "orders",
      title: "Orders and fulfilment",
      paragraphs: [
        "When you place an order, we create an order record and confirm it against available stock. Orders have statuses such as pending, confirmed, shipped, delivered, and cancelled. You can review your orders and their current status in your account.",
        "We may need to contact you about an order, including to resolve stock or address issues.",
      ],
    },
    {
      id: "payment",
      title: "Payment",
      ownerReview:
        "VeloceMart does not currently integrate an online payment provider; checkout records an order and its total without collecting payment. The owner must define how and when payment is collected and publish it here before orders accept payment.",
      paragraphs: [
        "The store records the total amount for each order you place. As of the last update of these terms, no online card, wallet, or bank payment is processed through the platform, so no card details are requested or stored.",
        "If online payment is enabled in future, the applicable payment methods, providers, and timing will be described here and in the checkout flow before you pay.",
      ],
    },
    {
      id: "shipping",
      title: "Shipping and delivery",
      ownerReview:
        "Shipping destinations, fees, delivery estimates, and carriers are not yet defined in the application. The owner must confirm these commercial terms before they are published.",
      paragraphs: [
        "The application does not currently calculate or display shipping charges, delivery estimates, or carrier tracking information. Delivery arrangements for an order are therefore confirmed with you directly until this section is finalised.",
      ],
    },
    {
      id: "returns",
      title: "Returns, cancellations, and refunds",
      ownerReview:
        "Return windows, refund timing, eligibility, and cancellation rules are not implemented and have not been confirmed. The owner must define them before this section is published.",
      paragraphs: [
        "The platform does not currently provide a self-service returns or refunds process. If you need to cancel or change an order, please contact us as soon as possible and we will advise on the options available at that time, subject to the policies the owner adopts.",
      ],
    },
    {
      id: "acceptable-use",
      title: "Acceptable use",
      paragraphs: [
        "You agree not to misuse the store. In particular, you must not:",
      ],
      list: [
        "Attempt to gain unauthorised access to any account, system, or data.",
        "Interfere with or disrupt the operation of the store, including through automated scraping or excessive requests.",
        "Submit false, misleading, or unlawful content, including through the contact form.",
        "Infringe the rights of others, including intellectual property rights.",
      ],
    },
    {
      id: "intellectual-property",
      title: "Intellectual property",
      paragraphs: [
        "The VeloceMart name, logos, store design, and original content are owned by VeloceMart or its licensors and are protected by applicable intellectual property laws. You may not copy, reproduce, or use them without permission, except as needed to use the store as intended.",
      ],
    },
    {
      id: "availability",
      title: "Platform availability",
      paragraphs: [
        "We aim to keep the store available, but we do not guarantee uninterrupted or error-free operation. The store may be unavailable during maintenance, updates, or events beyond our reasonable control. Features may be added, changed, or removed over time.",
      ],
    },
    {
      id: "termination",
      title: "Suspension and termination",
      paragraphs: [
        "We may suspend or terminate access to an account if we reasonably believe these terms have been breached, if required to protect the store or other users, or where required by law. You may stop using the store at any time and may request account deletion as described in our Privacy Policy.",
      ],
    },
    {
      id: "disclaimers",
      title: "Disclaimers and limitation of liability",
      paragraphs: [
        "To the fullest extent permitted by applicable law, the store is provided on an \"as is\" and \"as available\" basis, and we disclaim implied warranties to the extent allowed. Nothing in these terms excludes or limits liability that cannot lawfully be excluded or limited, including liability for fraud or for death or personal injury caused by negligence.",
      ],
      ownerReview:
        "A qualified legal professional should review and tailor the disclaimers and liability limits, including the governing-law and dispute-resolution section, for the operator's jurisdiction before publication.",
    },
    {
      id: "governing-law",
      title: "Governing law and disputes",
      ownerReview:
        "The governing jurisdiction and dispute-resolution process have not been confirmed. The owner must specify them with legal advice before publication.",
      paragraphs: [
        "These terms are intended to be governed by the laws of the operator's principal place of business, once confirmed. Until a governing-law clause is added, this section should be treated as incomplete.",
      ],
    },
    {
      id: "changes",
      title: "Changes to these terms",
      paragraphs: [
        "We may update these terms to reflect changes to the service or to legal requirements. When we do, we will revise the last-updated date at the top of this page. Your continued use of the store after an update means you accept the revised terms.",
      ],
    },
    {
      id: "contact",
      title: "Contact information",
      paragraphs: [
        "If you have questions about these terms, please contact us through the contact form. You can also review our Privacy Policy and Help Center for more information.",
      ],
    },
  ],
};
