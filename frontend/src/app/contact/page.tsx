export const metadata = {
  title: "Contact — VeloceMart",
  description: "Get in touch with our team.",
};

export default function ContactPage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-text-primary">Contact Us</h1>
      <div className="mt-6 space-y-4 text-text-secondary">
        <p>
          Have questions, feedback, or need assistance? We&apos;d love to
          hear from you.
        </p>
        <p>
          <strong className="text-text-primary">Email:</strong>{" "}
          support@velocemart.com
        </p>
        <p>
          <strong className="text-text-primary">Hours:</strong>{" "}
          Monday – Friday, 9:00 AM – 6:00 PM (EST)
        </p>
      </div>
    </section>
  );
}