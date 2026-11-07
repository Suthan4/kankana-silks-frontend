import LandingPage from "@/components/landingPage";
import Link from "next/link";

const citySeoLinks = [
  {
    href: "/mysore-sarees",
    title: "Premium sarees in Mysore",
    description:
      "Explore silk, Kanchipuram, Banarasi, Paithani and bridal saree collections, and find information about our Mysore store.",
  },
  {
    href: "/bengaluru-sarees",
    title: "Premium sarees in Bengaluru",
    description:
      "Browse traditional silk, Kanchipuram, Banarasi, Paithani and wedding sarees online from Bengaluru and Bangalore.",
  },
  {
    href: "/chennai-sarees",
    title: "Silk sarees online in Chennai",
    description:
      "Discover traditional saree collections online and check delivery availability for your Chennai address.",
  },
  {
    href: "/hyderabad-sarees",
    title: "Premium sarees in Hyderabad",
    description:
      "Explore traditional silk, Kanchipuram, Banarasi, Paithani and bridal styles online from Hyderabad.",
  },
];

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
            Discover premium silk sarees from Mysore
          </h2>
          <p className="mt-4 text-sm leading-7 text-neutral-700 sm:text-base">
            Kankana Silks is a Mysore-based saree store bringing together
            traditional Indian textiles and carefully curated saree
            collections. Explore available Kanchipuram silk, Banarasi,
            Paithani, Mysore silk and handloom styles for weddings,
            celebrations and special occasions. Shop online or visit our
            Mysore store.
          </p>
        </div>

        <div className="mt-9 grid gap-5 border-t border-neutral-200 pt-8 sm:grid-cols-2">
          {citySeoLinks.map((city) => (
            <article key={city.href} className="rounded-2xl border border-neutral-200 bg-white p-5">
              <h3 className="text-base font-semibold text-neutral-900">
                <Link href={city.href} className="underline-offset-4 hover:underline">
                  {city.title}
                </Link>
              </h3>
              <p className="mt-2 text-sm leading-6 text-neutral-700">
                {city.description}
              </p>
              <Link
                href={city.href}
                className="mt-3 inline-flex text-sm font-semibold text-neutral-900 underline underline-offset-4"
              >
                Explore sarees
              </Link>
            </article>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-2 text-sm text-neutral-700 sm:flex-row sm:items-center sm:justify-between">
          <p>
            Mysore store: First Floor, 464, Jayachamarajendra Road, 1st Stage,
            Vijayanagar, Mysore, Karnataka 570017.
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
