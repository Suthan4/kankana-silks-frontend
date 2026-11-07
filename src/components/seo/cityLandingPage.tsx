import Link from "next/link";

export type CitySeoSection = {
  heading: string;
  body: string;
};

export type CitySeoConfig = {
  city: string;
  alternateCityName?: string;
  title: string;
  description: string;
  heading: string;
  intro: string;
  sections: CitySeoSection[];
  isStoreCity?: boolean;
};

export default function CityLandingPage({ config }: { config: CitySeoConfig }) {
  const pageUrl = `https://www.kankanasilks.com/${config.city.toLowerCase()}-sarees`;
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: config.title,
    description: config.description,
    url: pageUrl,
    isPartOf: {
      "@type": "WebSite",
      name: "Kankana Silks",
      url: "https://www.kankanasilks.com",
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://www.kankanasilks.com" },
        { "@type": "ListItem", position: 2, name: `Sarees in ${config.city}`, item: pageUrl },
      ],
    },
  };

  return (
    <main className="bg-[#faf7f2]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-20">
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-neutral-500">
          <Link href="/" className="hover:text-neutral-900">Home</Link>
          <span className="mx-2">/</span>
          <span aria-current="page">Sarees in {config.city}</span>
        </nav>

        <div className="max-w-3xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-600">
            Kankana Silks · Online saree collection
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-950 sm:text-4xl lg:text-5xl">
            {config.heading}
          </h1>
          <p className="mt-5 text-base leading-8 text-neutral-700 sm:text-lg">
            {config.intro}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center rounded-full bg-neutral-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
            >
              Explore saree collections
            </Link>
            <Link
              href="/contact-us"
              className="inline-flex items-center justify-center rounded-full border border-neutral-300 px-6 py-3 text-sm font-semibold text-neutral-900 transition hover:border-neutral-900"
            >
              Contact Kankana Silks
            </Link>
          </div>
        </div>

        <div className="mt-12 grid gap-8 border-t border-neutral-200 pt-9 md:grid-cols-2">
          {config.sections.map((section) => (
            <article key={section.heading}>
              <h2 className="text-xl font-semibold text-neutral-950">{section.heading}</h2>
              <p className="mt-3 text-sm leading-7 text-neutral-700 sm:text-base">
                {section.body}
              </p>
            </article>
          ))}
        </div>

        {config.isStoreCity && (
          <aside className="mt-10 rounded-2xl border border-neutral-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-neutral-950">Visit our Mysore store</h2>
            <address className="mt-2 not-italic text-sm leading-7 text-neutral-700">
              First Floor, 464, Jayachamarajendra Road, Vijayanagar 1st Stage,
              Vijayanagar, Mysore, Karnataka 570017
            </address>
            <Link
              href="/contact-us"
              className="mt-3 inline-flex text-sm font-semibold text-neutral-900 underline underline-offset-4"
            >
              Get in touch for store details
            </Link>
          </aside>
        )}

        <section className="mt-12 rounded-2xl bg-white p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-neutral-950">
            Explore sarees for weddings, celebrations and everyday occasions
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-neutral-700 sm:text-base">
            Browse Kankana Silks collections including Kanchipuram, Banarasi,
            Paithani, Mysore silk and handloom sarees. Collection availability
            can vary, so check the product details or contact our team before
            placing an order.
          </p>
          <Link
            href="/shop"
            className="mt-5 inline-flex text-sm font-semibold text-neutral-900 underline underline-offset-4"
          >
            View the complete collection
          </Link>
        </section>
      </section>
    </main>
  );
}
