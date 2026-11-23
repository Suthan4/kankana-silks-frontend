import LandingPage from "@/components/landingPage";
import { getActiveBanners, getActiveHomeSections } from "@/lib/seo/server-api";
import Link from "next/link";
import {
  cityHref,
  citySeoEntries,
  legacyCityLinks,
  primaryCityLinks,
} from "@/config/seo/cities";

function CityDiscoverySection() {
  const metroCities = citySeoEntries.filter((city) => city.market === "metro");
  const regionalCities = citySeoEntries.filter(
    (city) => city.market === "regional",
  );

  return (
    <section
      aria-labelledby="city-discovery-title"
      className="border-t border-[#e8e0d7] bg-[#f7f4ef] px-4 py-14 sm:px-6 lg:py-20"
    >
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#6b5646]">
            Kankana Silks · Mysore, India
          </p>
          <h2
            id="city-discovery-title"
            className="mt-3 text-3xl font-semibold tracking-tight text-[#29231f] sm:text-4xl"
          >
            Explore saree collections across India
          </h2>
          <p className="mt-4 text-sm leading-7 text-[#6e6258] sm:text-base">
            Discover Kanchipuram, Banarasi, Paithani, Mysore silk and handloom
            sarees at Kankana Silks. Explore the current collection, compare
            product details and confirm delivery serviceability for your
            address during checkout.
          </p>
        </div>

        <div className="mt-9 grid gap-4 sm:grid-cols-2">
          {primaryCityLinks.map((city, index) => (
            <Link
              key={city.href}
              href={city.href}
              className="group flex min-h-36 flex-col justify-between rounded-2xl border border-[#ded4c9] bg-white p-6 transition duration-200 hover:-translate-y-0.5 hover:border-[#a58b77] hover:shadow-[0_12px_32px_rgba(55,39,27,0.08)]"
            >
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#6b5646]">
                {index === 0 ? "Our home city" : "Priority online destination"}
              </span>
              <span>
                <span className="block text-2xl font-semibold tracking-tight text-[#29231f]">
                  {city.city}
                </span>
                <span className="mt-1 block text-sm text-[#766a60]">
                  {city.note}
                </span>
              </span>
              <span className="mt-4 text-xs font-semibold text-[#47382e] group-hover:underline group-hover:underline-offset-4">
                Explore city collection <span aria-hidden="true">→</span>
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-10 border-t border-[#e3dacf] pt-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-[#29231f]">
                Explore more destinations
              </h3>
              <p className="mt-1 text-sm text-[#766a60]">
                City collections across major Indian markets
              </p>
            </div>
            <Link
              href="/shop"
              className="text-sm font-semibold text-[#47382e] underline underline-offset-4"
            >
              Browse all sarees
            </Link>
          </div>

          <div className="mt-5">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6b5646]">
              Major cities
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                ...legacyCityLinks,
                ...metroCities.map((city) => ({
                  city: city.city,
                  href: cityHref(city.slug),
                  note: city.focus,
                })),
              ].map((city) => (
                <Link
                  key={city.href}
                  href={city.href}
                  className="rounded-full border border-[#ded4c9] bg-white px-4 py-2 text-sm text-[#51453b] transition hover:border-[#8b7461] hover:bg-[#eee7de]"
                >
                  {city.city}
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6b5646]">
              More cities
            </p>
            <div className="flex flex-wrap gap-2">
              {regionalCities.map((city) => (
                <Link
                  key={city.slug}
                  href={cityHref(city.slug)}
                  className="rounded-full border border-transparent bg-[#eee8e0] px-3 py-2 text-sm text-[#5f5349] transition hover:border-[#d5c8ba] hover:bg-white"
                >
                  {city.city}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default async function Home() {
  // Fetched together on the server so the hero and sections are in the first
  // HTML (fast LCP, no layout jump when data arrives).
  const [initialSections, initialBanners] = await Promise.all([
    getActiveHomeSections(),
    getActiveBanners(),
  ]);

  const hasHeroHeading =
    initialBanners.length > 0 ||
    initialSections.some(
      (section) =>
        (section.layout === "slider" || section.type === "HERO_SLIDER") &&
        section.media?.some((media) => Boolean(media.overlayTitle?.trim())),
    );

  return (
    <>
      {!hasHeroHeading && (
        <header className="border-b border-[#e8e0d7] bg-[#f7f4ef] px-4 py-7 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <h1 className="text-2xl font-semibold tracking-tight text-[#29231f] sm:text-3xl">
              Premium Silk Sarees from Mysore
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-[#6e6258] sm:text-base">
              Explore Kanchipuram, Banarasi, Paithani, Mysore silk and handloom
              sarees online from Kankana Silks, with delivery options across India.
            </p>
          </div>
        </header>
      )}
      <LandingPage
        initialSections={initialSections}
        initialBanners={initialBanners}
      />
      <CityDiscoverySection />
    </>
  );
}
