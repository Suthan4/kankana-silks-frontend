import Link from "next/link";

export type CitySeoSection = {
  heading: string;
  body: string;
};

export type CitySeoConfig = {
  city: string;
  slug: string;
  alternateCityName?: string;
  title: string;
  description: string;
  heading: string;
  intro: string;
  sections: CitySeoSection[];
  isStoreCity?: boolean;
};

type ApiCategory = {
  id?: string;
  name?: string;
  slug?: string;
  description?: string | null;
  isActive?: boolean;
  children?: ApiCategory[];
  childPlacements?: Array<{ order?: number; child?: ApiCategory }>;
};

const SITE_URL = "https://www.kankanasilks.com";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "");

function flattenActiveCategories(categories: ApiCategory[]): ApiCategory[] {
  const flattened: ApiCategory[] = [];
  const visited = new Set<string>();

  const visit = (category: ApiCategory) => {
    if (!category || category.isActive === false) return;

    const key = category.slug || category.id || category.name;
    if (!key || visited.has(key)) return;
    visited.add(key);

    if (category.slug && category.name) flattened.push(category);

    const children =
      category.children ??
      (category.childPlacements ?? [])
        .slice()
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map((placement) => placement.child)
        .filter((child): child is ApiCategory => Boolean(child));

    children.forEach(visit);
  };

  categories.forEach(visit);
  return flattened;
}

async function getActiveCategories(): Promise<ApiCategory[]> {
  if (!API_BASE_URL) {
    console.error("NEXT_PUBLIC_API_URL is not configured; city page categories are unavailable.");
    return [];
  }

  try {
    const response = await fetch(`${API_BASE_URL}/categories/tree`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      console.error("City page category request failed:", response.status);
      return [];
    }

    const payload: { data?: ApiCategory[] } = await response.json();
    return flattenActiveCategories(Array.isArray(payload.data) ? payload.data : []);
  } catch (error) {
    console.error("Unable to load categories for city landing page:", error);
    return [];
  }
}

export default async function CityLandingPage({ config }: { config: CitySeoConfig }) {
  const categories = await getActiveCategories();
  const pageUrl = `${SITE_URL}/${config.slug}`;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: config.title,
    description: config.description,
    url: pageUrl,
    isPartOf: {
      "@type": "WebSite",
      name: "Kankana Silks",
      url: SITE_URL,
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: `Sarees in ${config.city}`, item: pageUrl },
      ],
    },
  };

  return (
    <main className="bg-[#faf7f2]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\\\u003c"),
        }}
      />
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-16">
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-neutral-500">
          <Link href="/" className="hover:text-neutral-900">Home</Link>
          <span className="mx-2">/</span>
          <span aria-current="page">Sarees in {config.city}</span>
        </nav>

        <header className="max-w-3xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-600">
            Kankana Silks · {config.city}
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
        </header>

        <section aria-labelledby="city-collections" className="mt-12 border-t border-neutral-200 pt-9">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
                Browse our collections
              </p>
              <h2 id="city-collections" className="mt-2 text-2xl font-semibold text-neutral-950">
                Saree categories available in {config.city}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600">
                Explore the same live category collection available across Kankana Silks.
                Product availability and delivery options are shown with each product and at checkout.
              </p>
            </div>
            <Link
              href="/shop"
              className="text-sm font-semibold text-neutral-900 underline underline-offset-4"
            >
              View all collections
            </Link>
          </div>

          {categories.length > 0 ? (
            <ul className="mt-6 grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => (
                <li key={category.slug}>
                  <Link
                    href={`/shop/${encodeURIComponent(category.slug!)}`}
                    className="group flex h-full flex-col rounded-xl border border-neutral-200 bg-white p-5 transition hover:border-neutral-400 hover:shadow-sm"
                  >
                    <span className="font-semibold text-neutral-950 group-hover:underline group-hover:underline-offset-4">
                      {category.name}
                    </span>
                    {category.description && (
                      <span className="mt-2 line-clamp-3 text-sm leading-6 text-neutral-600">
                        {category.description}
                      </span>
                    )}
                    <span className="mt-4 text-xs font-semibold text-neutral-700">
                      Explore collection →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-5 text-sm text-neutral-600">
              Our collections are temporarily unavailable. Please visit the{" "}
              <Link href="/shop" className="font-semibold text-neutral-900 underline underline-offset-4">
                shop page
              </Link>{" "}
              to browse current categories.
            </div>
          )}
        </section>

        <section className="mt-12 grid gap-8 border-t border-neutral-200 pt-9 md:grid-cols-2">
          {config.sections.map((section) => (
            <article key={section.heading}>
              <h2 className="text-xl font-semibold text-neutral-950">{section.heading}</h2>
              <p className="mt-3 text-sm leading-7 text-neutral-700 sm:text-base">
                {section.body}
              </p>
            </article>
          ))}
        </section>

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
      </section>
    </main>
  );
}
