import LandingPage from "@/components/landingPage";
import Link from "next/link";

function RegionalSeoContent() {
  return (
    <section
      aria-labelledby="regional-saree-shopping"
      className="border-t border-neutral-200 bg-[#faf7f2] px-4 py-12 sm:px-6 lg:py-16"
    >
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-neutral-600">
            Kankana Silks · Mysore, Karnataka
          </p>
          <h2
            id="regional-saree-shopping"
            className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl"
          >
            Shop authentic silk sarees online from Mysore
          </h2>
          <p className="mt-4 text-sm leading-7 text-neutral-700 sm:text-base">
            Kankana Silks is a Mysore-based saree store bringing together
            traditional Indian textiles and carefully curated saree
            collections. Explore Kanchipuram silk, Banarasi, Paithani and
            handloom styles for weddings, celebrations and everyday occasions.
            Browse the collection online or visit our Mysore store.
          </p>
        </div>

        <div className="mt-9 grid gap-6 border-t border-neutral-200 pt-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="text-base font-semibold text-neutral-900">
              Silk sarees in Mysore
            </h3>
            <p className="mt-2 text-sm leading-6 text-neutral-700">
              Discover traditional and occasion-ready sarees from our Mysore
              store in Vijayanagar, Karnataka.
            </p>
          </div>
          <div>
            <h3 className="text-base font-semibold text-neutral-900">
              Online saree shopping in Bengaluru
            </h3>
            <p className="mt-2 text-sm leading-6 text-neutral-700">
              Browse the Kankana Silks collection online and place orders for
              delivery in Bengaluru and across Karnataka.
            </p>
          </div>
          <div>
            <h3 className="text-base font-semibold text-neutral-900">
              Delivery to Chennai and Hyderabad
            </h3>
            <p className="mt-2 text-sm leading-6 text-neutral-700">
              Shop from Chennai, Hyderabad and other cities with our India-wide
              shipping service.
            </p>
          </div>
          <div>
            <h3 className="text-base font-semibold text-neutral-900">
              Saree delivery across India
            </h3>
            <p className="mt-2 text-sm leading-6 text-neutral-700">
              Explore Indian silk and handloom traditions from wherever you
              shop in India, with order support from Kankana Silks.
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-2 text-sm text-neutral-700 sm:flex-row sm:items-center sm:justify-between">
          <p>
            Mysore store: 464, First Floor, Jayachamarajendra Road, 1st Stage,
            Vijayanagar, Mysore, Karnataka.
          </p>
          <Link
            href="/shop"
            className="font-semibold text-neutral-900 underline underline-offset-4"
          >
            Explore all saree collections
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <LandingPage />
      <RegionalSeoContent />
    </>
  );
}
