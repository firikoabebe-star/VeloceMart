export const metadata = {
  title: "About — VeloceMart",
  description: "Learn about our mission and story.",
};

export default function AboutPage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-text-primary">About VeloceMart</h1>
      <div className="mt-6 space-y-4 text-text-secondary">
        <p>
          VeloceMart is a curated fashion marketplace offering premium clothing
          and accessories for men and women. We partner with trusted brands and
          artisans to bring you the best selection of modern essentials and
          statement pieces.
        </p>
        <p>
          Our mission is to make high-quality fashion accessible, affordable,
          and effortless — from discovery to delivery.
        </p>
      </div>
    </section>
  );
}