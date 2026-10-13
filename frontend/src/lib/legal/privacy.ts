import type { LegalDocument } from "./types";

export const PRIVACY_POLICY: LegalDocument = {
  title: "Privacy Policy",
  intro:
    "This Privacy Policy explains what information VeloceMart collects when you use our store, why we collect it, and the choices available to you. It describes the data that is actually processed by the platform today.",
  lastUpdated: "October 13, 2026",
  sections: [
    {
      id: "scope",
      title: "Scope of this policy",
      paragraphs: [
        "This policy applies to the VeloceMart online store and the account, shopping, and support features it provides. It does not cover third-party websites that we link to, which are governed by their own privacy policies.",
        "We have written this policy in plain language and only describe processing that the current platform performs. Where a feature that would collect additional information is not yet enabled, we say so explicitly.",
      ],
    },
    {
      id: "information-we-collect",
      title: "Information we collect",
      paragraphs: [
        "We collect information that you provide directly, information created when you use the store, and a limited amount of technical information needed to operate the service securely.",
      ],
      subsections: [
        {
          title: "Account information",
          paragraphs: [
            "When you create an account we collect your first name, last name, and email address. Your password is stored only as a one-way bcrypt hash and is never stored or logged in plain text. We also record your account role, whether your email has been verified, and creation and update timestamps.",
          ],
        },
        {
          title: "Email verification and password reset codes",
          paragraphs: [
            "To verify your email address and to help you reset a forgotten password, we generate a six-digit one-time code. We store the code, its purpose, its expiry time, and whether it has been used so that it can be validated once and then invalidated.",
          ],
        },
        {
          title: "Google Sign-In",
          paragraphs: [
            "If you choose to sign in with Google, Google returns a stable account identifier, your verified email address, and your display name to us. We use a Google-specific password marker so that password sign-in cannot be used for that account. We do not receive your Google password.",
          ],
        },
        {
          title: "Orders, cart, and checkout",
          paragraphs: [
            "When you add items to your cart or place an order, we store the products and variants, quantities, unit prices, order total, order status, and relevant timestamps. Checkout converts the items in your cart into an order associated with your account.",
          ],
        },
        {
          title: "Delivery addresses and wishlist",
          paragraphs: [
            "If you save a delivery address, we store the recipient name, address lines, city, region, postal code, country, optional phone number, and label. If you use the wishlist, we store the products you have saved.",
          ],
        },
        {
          title: "Support messages",
          paragraphs: [
            "When you contact us through the contact form, we collect the name, email address, inquiry category, subject, message, and any optional order reference you provide, so that we can respond to your request.",
          ],
        },
        {
          title: "Technical and security information",
          paragraphs: [
            "Our servers record limited request information such as the HTTP method, the requested path, the response status, and a timestamp. This is used to operate the service, diagnose faults, and detect abuse. Authentication events are logged without passwords or one-time codes.",
          ],
        },
      ],
    },
    {
      id: "information-not-collected",
      title: "Information we do not collect",
      paragraphs: [
        "We want to be precise about what the platform does not do:",
      ],
      list: [
        "We do not collect or store payment card numbers, because no card payment processing is integrated with the store.",
        "We do not run advertising trackers or sell personal information.",
        "We do not use third-party behavioural analytics or session-replay tools.",
        "We do not collect precise location data or device advertising identifiers.",
        "We only ask for a phone number as an optional part of a delivery address; we do not require one to create an account.",
      ],
    },
    {
      id: "how-we-use",
      title: "How we use information",
      list: [
        "To create and secure your account, including verifying your email and authenticating sign-in.",
        "To provide the shopping experience, including your cart, wishlist, and delivery addresses.",
        "To process and fulfil orders and to show you your order history and status.",
        "To send service messages such as email verification and password reset codes.",
        "To respond to support requests you send us.",
        "To keep the service secure, prevent abuse, and diagnose technical problems.",
      ],
    },
    {
      id: "legal-basis",
      title: "Why we are allowed to process your information",
      paragraphs: [
        "We process account, order, and support information because it is necessary to provide the service you request and to perform our agreement with you. We process security and diagnostic information because we have a legitimate interest in keeping the service safe and reliable. Where your consent is required for a particular use, we will ask for it separately.",
        "If you are located in a region with specific data-protection rights, you may have additional rights as described under your privacy choices below.",
      ],
    },
    {
      id: "cookies",
      title: "Cookies and local storage",
      paragraphs: [
        "We use a small number of first-party cookies that are essential to signing in. When you authenticate, we set an access token cookie and a refresh token cookie. Both are HTTP-only, which means they cannot be read by client-side scripts, and both are marked Secure in production.",
      ],
      list: [
        "access_token: keeps you signed in for a short period (about 15 minutes).",
        "refresh_token: allows your session to be renewed for up to about 7 days, or until you sign out.",
      ],
      subsections: [
        {
          title: "Local storage",
          paragraphs: [
            "Your selected colour theme (light or dark) is stored in your browser's local storage. It never leaves your device.",
          ],
        },
        {
          title: "No non-essential cookies",
          paragraphs: [
            "We do not set third-party advertising cookies, and we do not use cookie-based analytics. If this changes, we will update this policy and provide any required notice or choices.",
          ],
        },
      ],
    },
    {
      id: "third-parties",
      title: "Third-party services",
      paragraphs: [
        "We rely on a small number of service providers to run the store. They process information only as needed to provide their service to us.",
      ],
      list: [
        "A managed PostgreSQL database and hosting provider store the application data described above.",
        "Resend is used to deliver transactional email, including verification codes, password reset codes, and contact-form notifications.",
        "Google is used for Google Sign-In when enabled, and Google's Gemini API may be used server-side with product catalogue information to generate product descriptions and product recommendations. This processing does not include your account, order, or contact information.",
        "Product images may be served from Cloudinary, a third-party image delivery service.",
      ],
      ownerReview:
        "Confirm the exact names, locations, and data-processing agreements of the hosting, database, and email providers before publishing. Replace the generic descriptions above with the verified vendors.",
    },
    {
      id: "retention",
      title: "Data retention",
      paragraphs: [
        "We keep account and order information for as long as your account is active so that we can provide order history and support. One-time verification and reset codes expire after ten minutes and are marked as used once redeemed; we do not currently run an automated purge, so expired records may remain in the database until they are removed.",
        "We do not operate an automated account-deletion process today. You can ask us to delete your account and associated personal information by contacting support, and we will action verified requests.",
      ],
      ownerReview:
        "Define and document a concrete retention schedule (for example, how long cancelled orders and support messages are kept) and whether an automated deletion or purge process will be introduced.",
    },
    {
      id: "security",
      title: "How we protect information",
      list: [
        "Passwords are hashed with bcrypt and are never stored in a recoverable form.",
        "Authentication uses signed JSON Web Tokens delivered in HTTP-only cookies that are marked Secure in production.",
        "Resetting a password invalidates existing sessions by rotating the account token version.",
        "Access to administrative functions is restricted by role-based access control.",
        "Incoming requests are validated and rate-limited to reduce abuse.",
      ],
      paragraphs: [
        "No method of transmission or storage is completely secure, so we cannot guarantee absolute security. If we become aware of a security incident affecting your information, we will take appropriate steps and provide notice where required.",
      ],
    },
    {
      id: "your-choices",
      title: "Your privacy choices",
      paragraphs: [
        "You can review and update your profile details and saved addresses from your account. You can sign out at any time. To request access to, correction of, or deletion of your personal information, or to object to a particular use, contact us using the details below.",
        "We will respond to verified requests within a reasonable period. We may need to confirm your identity before acting on a request.",
      ],
    },
    {
      id: "children",
      title: "Children's privacy",
      paragraphs: [
        "The store is not directed at children, and we do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us so that we can remove it.",
      ],
    },
    {
      id: "changes",
      title: "Changes to this policy",
      paragraphs: [
        "We may update this policy to reflect changes to the service or to legal requirements. When we do, we will revise the last-updated date at the top of this page. Material changes will be communicated through the store where appropriate.",
      ],
    },
    {
      id: "contact",
      title: "Contact us",
      paragraphs: [
        "If you have questions about this policy or how your information is handled, please contact us through the contact form. You can also review our Terms of Service and Help Center for more information about how the store works.",
      ],
    },
  ],
};
