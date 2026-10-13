/**
 * Help center content. Kept as typed, serializable data so both the server
 * page and the client-side search/accordion components can consume it, and so
 * the copy is easy to maintain in one place.
 *
 * All topics here reflect features the application actually supports today.
 * Topics that are not implemented (online payment, shipping rates, returns)
 * are written honestly as unavailable rather than promised.
 */

export type HelpIconName =
  | "sparkles"
  | "lock"
  | "shopping-bag"
  | "cart"
  | "receipt"
  | "shield"
  | "chat";

export interface HelpSection {
  heading: string;
  paragraphs?: string[];
  steps?: string[];
  list?: string[];
}

export interface HelpRelatedLink {
  label: string;
  href: string;
}

export interface HelpArticle {
  slug: string;
  title: string;
  summary: string;
  categoryId: string;
  sections: HelpSection[];
  related?: HelpRelatedLink[];
}

export interface HelpCategory {
  id: string;
  title: string;
  description: string;
  icon: HelpIconName;
}

export interface HelpFaq {
  id: string;
  question: string;
  answer: string;
}

export const HELP_CATEGORIES: HelpCategory[] = [
  {
    id: "getting-started",
    title: "Getting started & accounts",
    description: "Create an account, verify your email, and manage your profile.",
    icon: "sparkles",
  },
  {
    id: "sign-in",
    title: "Sign-in & password recovery",
    description: "Sign in, use Google Sign-In, and reset a forgotten password.",
    icon: "lock",
  },
  {
    id: "shopping",
    title: "Shopping & product discovery",
    description: "Browse categories, search products, and save your favourites.",
    icon: "shopping-bag",
  },
  {
    id: "cart-checkout",
    title: "Cart & checkout",
    description: "Understand how your cart and checkout work.",
    icon: "cart",
  },
  {
    id: "orders",
    title: "Orders & order status",
    description: "Review your order history and understand each status.",
    icon: "receipt",
  },
  {
    id: "privacy-security",
    title: "Privacy & account security",
    description: "How your data is handled and how to keep your account safe.",
    icon: "shield",
  },
  {
    id: "support",
    title: "Contacting support",
    description: "Reach the team and get help with your account or orders.",
    icon: "chat",
  },
];

export const HELP_ARTICLES: HelpArticle[] = [
  {
    slug: "create-your-account",
    title: "Create your VeloceMart account",
    summary:
      "Register with your name, email, and password, then verify your email to sign in.",
    categoryId: "getting-started",
    sections: [
      {
        heading: "What you need",
        list: [
          "A valid email address you can access.",
          "Your first and last name.",
          "A password of at least 8 characters.",
        ],
      },
      {
        heading: "Create the account",
        steps: [
          "Open the register page from the Sign In menu.",
          "Enter your first name, last name, email address, and a password.",
          "Submit the form. We send a 6-digit verification code to your email.",
          "Enter the code on the verification screen to activate your account.",
        ],
      },
      {
        heading: "Notes",
        paragraphs: [
          "You cannot sign in until your email is verified. If the code does not arrive, you can request a new one from the verification screen.",
          "If you register with an email that already has a verified account, we ask you to sign in instead.",
        ],
      },
    ],
    related: [
      { label: "Verify your email address", href: "/help/verify-your-email" },
      { label: "Reset your password", href: "/help/reset-your-password" },
    ],
  },
  {
    slug: "verify-your-email",
    title: "Verify your email address",
    summary:
      "Confirm your account with the 6-digit code we email you after registering.",
    categoryId: "getting-started",
    sections: [
      {
        heading: "How verification works",
        paragraphs: [
          "After you register we send a 6-digit code to your email address. Enter it on the verification screen to activate your account. Codes expire after 10 minutes.",
        ],
      },
      {
        heading: "If your code has expired or did not arrive",
        steps: [
          "Return to the verification screen.",
          "Choose to resend the code.",
          "Check your inbox and spam folder for the new code.",
          "Enter the most recent code, as requesting a new one invalidates the previous code.",
        ],
      },
      {
        heading: "Common messages",
        list: [
          "\"Invalid verification code\" — check the digits and try the most recent code.",
          "\"Verification code has expired\" — request a new code.",
          "\"Email is already verified\" — you can sign in directly.",
        ],
      },
    ],
    related: [
      { label: "Create your VeloceMart account", href: "/help/create-your-account" },
      { label: "Sign in with Google", href: "/help/sign-in-with-google" },
    ],
  },
  {
    slug: "sign-in-with-google",
    title: "Sign in with Google",
    summary:
      "Use your Google account to sign in without a VeloceMart password.",
    categoryId: "sign-in",
    sections: [
      {
        heading: "How it works",
        paragraphs: [
          "Choose \"Sign in with Google\" on the sign-in page. If you do not already have a VeloceMart account for that verified Google email, we create one for you on first sign-in.",
          "Google accounts created this way are marked as verified and do not use a VeloceMart password.",
        ],
      },
      {
        heading: "Important behaviour",
        list: [
          "We only accept a Google email that Google reports as verified.",
          "If an account already exists for that email with a password, we do not link it automatically. Please sign in with your email and password.",
          "To keep accounts consistent, a Google sign-in is never automatically merged with an existing password account.",
        ],
      },
      {
        heading: "If Google sign-in fails",
        paragraphs: [
          "You can always sign in with your email address and password instead. If you do not have a password because your account was created with Google, use the password reset flow to set one.",
        ],
      },
    ],
    related: [
      { label: "Reset your password", href: "/help/reset-your-password" },
      { label: "Keep your account secure", href: "/help/keep-your-account-secure" },
    ],
  },
  {
    slug: "reset-your-password",
    title: "Reset your password",
    summary:
      "Request a 6-digit reset code by email and set a new password.",
    categoryId: "sign-in",
    sections: [
      {
        heading: "Request a reset code",
        steps: [
          "Open the forgot-password page from the sign-in screen.",
          "Enter the email address for your account.",
          "Check your email for the 6-digit reset code. It expires after 10 minutes.",
        ],
      },
      {
        heading: "Set a new password",
        steps: [
          "Enter the reset code and your new password (at least 8 characters).",
          "Confirm the new password and submit the form.",
          "Sign in again with your new password.",
        ],
      },
      {
        heading: "After a reset",
        paragraphs: [
          "For your security, resetting your password signs you out everywhere by invalidating existing sessions. You will need to sign in again on each device.",
        ],
      },
    ],
    related: [
      { label: "Keep your account secure", href: "/help/keep-your-account-secure" },
      { label: "Sign in with Google", href: "/help/sign-in-with-google" },
    ],
  },
  {
    slug: "browse-and-search-products",
    title: "Browse and search for products",
    summary:
      "Find products by category, collection, or search, and filter the results.",
    categoryId: "shopping",
    sections: [
      {
        heading: "Ways to browse",
        list: [
          "Use the Men, Women, and Kids menus to browse by department and category.",
          "Visit New Arrivals, Best Sellers, or Sale from the navigation or footer.",
          "Open a product to see its available sizes, colours, and price.",
        ],
      },
      {
        heading: "Search",
        steps: [
          "Open the search field from the header.",
          "Type a product name or keyword.",
          "Select a result to open the product page.",
        ],
      },
      {
        heading: "Product availability",
        paragraphs: [
          "Each product lists variants such as size and colour. Availability depends on the variant's stock, which is checked again when you place an order.",
        ],
      },
    ],
    related: [
      { label: "Save items to your wishlist", href: "/help/save-items-to-your-wishlist" },
      { label: "Cart & checkout", href: "/help/cart-and-checkout" },
    ],
  },
  {
    slug: "save-items-to-your-wishlist",
    title: "Save items to your wishlist",
    summary:
      "Keep track of products you like and find them again from your account.",
    categoryId: "shopping",
    sections: [
      {
        heading: "Adding and removing items",
        paragraphs: [
          "When signed in, use the wishlist control on a product to save it. Open your wishlist from your account area to review or remove saved items.",
        ],
      },
      {
        heading: "Sign-in required",
        paragraphs: [
          "Your wishlist is tied to your account, so you need to be signed in to use it.",
        ],
      },
    ],
    related: [
      { label: "Browse and search for products", href: "/help/browse-and-search-products" },
      { label: "Create your VeloceMart account", href: "/help/create-your-account" },
    ],
  },
  {
    slug: "cart-and-checkout",
    title: "Cart & checkout",
    summary:
      "How items are added to your cart and converted into an order.",
    categoryId: "cart-checkout",
    sections: [
      {
        heading: "Your cart",
        paragraphs: [
          "Adding a product to your cart does not reserve stock. Cart contents are tied to your account, so you need to be signed in to view and manage your cart.",
        ],
      },
      {
        heading: "Checkout",
        steps: [
          "Review the items in your cart and their quantities.",
          "Proceed to checkout while signed in.",
          "We validate stock and create an order with a total amount.",
          "Review the order in your account's order history.",
        ],
      },
      {
        heading: "If checkout cannot complete",
        paragraphs: [
          "If an item is no longer available in the quantity requested, checkout is stopped so that you can adjust your cart. Remove or reduce the affected item and try again.",
        ],
      },
    ],
    related: [
      { label: "Orders & order status", href: "/help/orders-and-order-status" },
      { label: "Browse and search for products", href: "/help/browse-and-search-products" },
    ],
  },
  {
    slug: "orders-and-order-status",
    title: "Orders & order status",
    summary:
      "Review your order history and understand what each order status means.",
    categoryId: "orders",
    sections: [
      {
        heading: "Viewing your orders",
        steps: [
          "Sign in and open your account.",
          "Go to Order History.",
          "Select an order to see its items, total, and current status.",
        ],
      },
      {
        heading: "Order statuses",
        list: [
          "Pending — the order has been created and is awaiting confirmation.",
          "Confirmed — the order has been confirmed.",
          "Shipped — the order has been marked as shipped.",
          "Delivered — the order has been marked as delivered.",
          "Cancelled — the order was cancelled.",
        ],
      },
      {
        heading: "A note on tracking",
        paragraphs: [
          "The store does not currently provide carrier tracking numbers or live courier tracking. Your order status in your account reflects the status recorded on the platform.",
        ],
      },
    ],
    related: [
      { label: "Cart & checkout", href: "/help/cart-and-checkout" },
      { label: "Contact support", href: "/help/contact-support" },
    ],
  },
  {
    slug: "shipping-delivery-and-returns",
    title: "Shipping, delivery & returns",
    summary:
      "What the store does and does not currently support for shipping, delivery, and returns.",
    categoryId: "orders",
    sections: [
      {
        heading: "Shipping",
        paragraphs: [
          "Shipping rates and delivery estimates are not currently calculated or displayed at checkout. The store records your order and its total; it does not add shipping charges or promise a delivery window today.",
        ],
      },
      {
        heading: "Delivery",
        paragraphs: [
          "Carrier tracking numbers and live courier tracking are not currently displayed. You can follow the recorded status of an order — Pending, Confirmed, Shipped, Delivered, or Cancelled — in Order History in your account.",
        ],
      },
      {
        heading: "Returns & exchanges",
        paragraphs: [
          "Self-service returns and exchanges are not currently supported. If you need to return or exchange an item, contact support with your order reference and we will advise on the options available.",
        ],
      },
    ],
    related: [
      { label: "Orders & order status", href: "/help/orders-and-order-status" },
      { label: "Contact support", href: "/help/contact-support" },
    ],
  },
  {
    slug: "manage-your-account-and-addresses",
    title: "Manage your account and addresses",
    summary:
      "Update your profile details and save delivery addresses for checkout.",
    categoryId: "privacy-security",
    sections: [
      {
        heading: "Profile details",
        paragraphs: [
          "You can update your first name, last name, and email from your account profile. Changing your email may require verification before you can sign in with it.",
        ],
      },
      {
        heading: "Delivery addresses",
        list: [
          "Add one or more delivery addresses to your account.",
          "Choose a default address for convenience.",
          "Edit or remove addresses you no longer use.",
        ],
      },
      {
        heading: "Privacy",
        paragraphs: [
          "For details about the information we store and how it is used, read our Privacy Policy.",
        ],
      },
    ],
    related: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Keep your account secure", href: "/help/keep-your-account-secure" },
    ],
  },
  {
    slug: "keep-your-account-secure",
    title: "Keep your account secure",
    summary:
      "Practical steps to protect your VeloceMart account and personal information.",
    categoryId: "privacy-security",
    sections: [
      {
        heading: "Recommended steps",
        list: [
          "Use a unique password of at least 8 characters and keep it private.",
          "Never share verification or password reset codes with anyone.",
          "Reset your password immediately if you suspect unauthorised access.",
          "Sign out on shared devices when you have finished.",
        ],
      },
      {
        heading: "How we protect your account",
        list: [
          "Passwords are stored as one-way hashes and are never shown back to you.",
          "Sign-in uses secure, HTTP-only session cookies.",
          "Changing your password signs out existing sessions.",
        ],
      },
    ],
    related: [
      { label: "Reset your password", href: "/help/reset-your-password" },
      { label: "Privacy Policy", href: "/privacy" },
    ],
  },
  {
    slug: "contact-support",
    title: "Contact support",
    summary:
      "How to reach the VeloceMart team when you need help with an account or order.",
    categoryId: "support",
    sections: [
      {
        heading: "Before you contact us",
        list: [
          "Check the help articles for account, cart, and order questions.",
          "Have your order reference ready if your question is about an order.",
        ],
      },
      {
        heading: "Send a message",
        paragraphs: [
          "Use the contact form and choose the category that best matches your question. Include as much relevant detail as you can so we can help on the first reply.",
        ],
      },
      {
        heading: "What to expect",
        paragraphs: [
          "Messages are delivered to our support inbox by email. We do not currently advertise a guaranteed response time, so please allow reasonable time for a reply.",
        ],
      },
    ],
    related: [
      { label: "Contact support", href: "/contact" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
];

export const HELP_FAQS: HelpFaq[] = [
  {
    id: "faq-create-account",
    question: "How do I create an account?",
    answer:
      "Open the register page from the Sign In menu and enter your name, email, and a password of at least 8 characters. We email you a 6-digit code to verify your address before you can sign in.",
  },
  {
    id: "faq-google-sign-in",
    question: "Can I sign in with Google?",
    answer:
      "Yes. Use \"Sign in with Google\" on the sign-in page. If you do not have a VeloceMart account for that verified Google email, one is created on first sign-in. If an account already exists for that email with a password, sign in with your email and password instead.",
  },
  {
    id: "faq-verify-email",
    question: "I did not receive my verification email. What should I do?",
    answer:
      "On the verification screen, request a new code and check your spam or promotions folder. Codes expire after 10 minutes, and requesting a new code invalidates the previous one, so always use the most recent code.",
  },
  {
    id: "faq-reset-password",
    question: "How do I reset my password?",
    answer:
      "Use the forgot-password link on the sign-in page, enter your email, and we send a 6-digit reset code. Enter the code with a new password. Resetting your password signs you out on all devices.",
  },
  {
    id: "faq-cart-signin",
    question: "Why do I need to sign in to use the cart?",
    answer:
      "Your cart is linked to your account so it can be turned into an order at checkout. Adding an item to your cart does not reserve it; stock is checked again when you place the order.",
  },
  {
    id: "faq-order-status",
    question: "What do the order statuses mean?",
    answer:
      "Orders move through Pending, Confirmed, Shipped, Delivered, or Cancelled. You can see the current status for each order in Order History in your account.",
  },
  {
    id: "faq-payment",
    question: "What payment methods do you accept?",
    answer:
      "Online payment is not currently integrated with the store, so no card or wallet details are collected on the site. The checkout records your order and its total. If online payment is enabled in the future, the available methods will be shown before you pay.",
  },
  {
    id: "faq-shipping-returns",
    question: "Do you offer shipping and returns?",
    answer:
      "Shipping rates, delivery estimates, and self-service returns are not currently supported by the store. For help with a specific order, contact support and we will advise on the options available at that time.",
  },
  {
    id: "faq-tracking",
    question: "Can I track my shipment?",
    answer:
      "The store does not currently display carrier tracking numbers. You can follow the recorded status of your order in Order History, and contact support if you need an update.",
  },
  {
    id: "faq-delete-account",
    question: "How do I delete my account or my data?",
    answer:
      "There is no self-service delete button yet. Send a request through the contact form and we will action verified deletion requests. See our Privacy Policy for details about the data we hold.",
  },
  {
    id: "faq-privacy",
    question: "How is my personal information used?",
    answer:
      "We use your account, order, and support information to provide the store and help you, as described in our Privacy Policy. We do not run advertising trackers or sell your personal information.",
  },
  {
    id: "faq-contact-support",
    question: "How do I contact support?",
    answer:
      "Use the contact form and pick the category that matches your question. Include your order reference if your question is about an order. Messages are delivered to our support inbox by email.",
  },
];

export function getHelpArticle(slug: string): HelpArticle | undefined {
  return HELP_ARTICLES.find((article) => article.slug === slug);
}

export function getHelpCategory(id: string): HelpCategory | undefined {
  return HELP_CATEGORIES.find((category) => category.id === id);
}

export function getArticlesForCategory(categoryId: string): HelpArticle[] {
  return HELP_ARTICLES.filter((article) => article.categoryId === categoryId);
}

export interface HelpSearchResult {
  type: "article" | "faq";
  title: string;
  excerpt: string;
  href: string;
}

/**
 * Local full-text search across help articles and FAQs. Matching is
 * case-insensitive and scores title matches above body matches so the most
 * relevant results surface first.
 */
export function searchHelp(query: string): HelpSearchResult[] {
  const term = query.trim().toLowerCase();
  if (term.length === 0) return [];

  const results: (HelpSearchResult & { score: number })[] = [];

  for (const article of HELP_ARTICLES) {
    const haystack = [
      article.title,
      article.summary,
      ...article.sections.flatMap((section) => [
        section.heading,
        ...(section.paragraphs ?? []),
        ...(section.steps ?? []),
        ...(section.list ?? []),
      ]),
    ]
      .join(" ")
      .toLowerCase();

    if (haystack.includes(term)) {
      const inTitle = article.title.toLowerCase().includes(term);
      results.push({
        type: "article",
        title: article.title,
        excerpt: article.summary,
        href: `/help/${article.slug}`,
        score: inTitle ? 3 : 2,
      });
    }
  }

  for (const faq of HELP_FAQS) {
    const haystack = `${faq.question} ${faq.answer}`.toLowerCase();
    if (haystack.includes(term)) {
      results.push({
        type: "faq",
        title: faq.question,
        excerpt: faq.answer,
        href: "/help#faqs",
        score: faq.question.toLowerCase().includes(term) ? 3 : 1,
      });
    }
  }

  return results
    .sort((a, b) => b.score - a.score)
    .map((result) => ({
      type: result.type,
      title: result.title,
      excerpt: result.excerpt,
      href: result.href,
    }));
}
