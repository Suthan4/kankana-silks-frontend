"use client";
import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  X,
  Clock,
  Phone,
  Navigation,
  ExternalLink,
  Mail,
} from "lucide-react";

/* ─── STORE DATA — update with real details ─── */
const STORES = [
  {
    id: 1,
    name: "Kankana Silks — Mysuru",
    address:
      "First Floor, 464, Jayachamarajendra Rd, Vijayanagar 1st Stage, Vijayanagar, Mysuru, Karnataka 570017",
    // Set NEXT_PUBLIC_STORE_PHONE (e.g. "+91 9XXXXXXXXX"). Hidden until set.
    phone: process.env.NEXT_PUBLIC_STORE_PHONE ?? "",
    hours: "Mon – Sat: 9:00 AM – 8:00 PM\nSun: 10:00 AM – 6:00 PM",
    lat: 12.3292222,
    lng: 76.6154278,
    mapUrl:
      "https://www.google.com/maps/dir//Kankana+Silks,+First+Floor,+464,+Jayachamarajendra+Rd,+Vijayanagar+1st+Stage,+Vijayanagar,+Mysuru,+Karnataka+570017/@13.0435441,80.1540219,15z/data=!3m1!4b1!4m8!4m7!1m0!1m5!1m1!1s0x3baf7b51283647e1:0xd90e62d8de029073!2m2!1d76.6154278!2d12.3292222?entry=ttu&g_ep=EgoyMDI2MDUwNi4wIKXMDSoASAFQAw%3D%3D",
  },
];

/* ─── STORE LOCATOR MODAL ─── */
function StoreLocatorModal({ onClose }: { onClose: () => void }) {
  const [selected, setSelected] = useState(STORES[0]);

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex items-end md:items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="relative z-10 w-full md:max-w-3xl bg-white rounded-t-3xl md:rounded-2xl overflow-hidden shadow-2xl max-h-[92vh] md:max-h-[85vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 flex-shrink-0">
          <div>
            <h2 className="text-base font-futura-bold tracking-wide text-gray-900 uppercase">
              Our Stores
            </h2>
            <p className="text-xs text-gray-600 mt-0.5">Find us near you</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close stores"
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden min-h-0">
          {/* LEFT — store list */}
          <div className="md:w-72 flex-shrink-0 border-b md:border-b-0 md:border-r border-gray-100 overflow-y-auto">
            {STORES.map((store) => (
              <button
                key={store.id}
                onClick={() => setSelected(store)}
                className={`w-full text-left px-6 py-5 border-b border-gray-50 transition-colors ${
                  selected.id === store.id
                    ? "border-l-2 border-l-brand-primary bg-brand-primary-soft"
                    : "hover:bg-gray-50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                      selected.id === store.id
                        ? "bg-brand-primary"
                        : "bg-gray-100"
                    }`}
                  >
                    <MapPin
                      className={`w-3.5 h-3.5 ${selected.id === store.id ? "text-white" : "text-gray-500"}`}
                    />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-900 leading-snug">
                      {store.name}
                    </p>
                    <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                      {store.address}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* RIGHT — selected store details + map embed */}
          <div className="flex-1 flex flex-col overflow-hidden min-h-0">
            {/* Map embed */}
            <div className="relative h-48 md:h-56 flex-shrink-0 bg-gray-100">
              <iframe
                key={selected.id}
                title={selected.name}
                src={`https://maps.google.com/maps?q=${selected.lat},${selected.lng}&z=16&output=embed&hl=en`}
                className="w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            {/* Store info */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              <h3 className="text-sm font-futura-bold text-gray-900">
                {selected.name}
              </h3>

              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-gray-600 leading-relaxed">
                  {selected.address}
                </p>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">
                  {selected.hours}
                </p>
              </div>

              {selected.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <a
                    href={`tel:${selected.phone.replace(/\s+/g, "")}`}
                    className="text-xs text-gray-600 hover:text-black transition-colors"
                  >
                    {selected.phone}
                  </a>
                </div>
              )}

              {/* CTA buttons */}
              <div className="flex gap-3 pt-1">
                <a
                  href={selected.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="brand-button flex-1 gap-2 rounded-xl py-2.5"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  Get Directions
                </a>
                <a
                  href={selected.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="brand-outline-button gap-2 rounded-xl px-4 py-2.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open Maps
                </a>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── MAIN FOOTER ─── */
export default function Footer() {
  const [email, setEmail] = useState("");
  const [storeLocatorOpen, setStoreLocatorOpen] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: wire up newsletter API
    setEmail("");
  };

  const footerLinks = {
    Shop: [
      { label: "About Us", href: "/about-us" },
      { label: "Contact Us", href: "/contact-us" },
      { label: "FAQ", href: "/faq" },
      { label: "Return & Refund Policy", href: "/return-policy" },
      { label: "Cancellation Policy", href: "/cancellation-policy" },
      {
        label: "Product Details & Appearance",
        href: "/product-details-appearance",
      },
      { label: "Shipping Policy", href: "/shipping-policy" },
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms & Conditions", href: "/terms-and-conditions" },
    ],
    Connect: [
      {
        label: "Instagram",
        href: "https://instagram.com/kankanasilks",
        external: true,
      },
      {
        label: "Youtube",
        href: "https://youtube.com/@kankanasilks",
        external: true,
      },
    ],
  };

  return (
    <>
      {/* ── FOOTER ── */}
      <footer className="brand-section-dark border-t border-brand-accent/25">
        {/* Main grid */}
        <div className="max-w-screen-xl mx-auto px-6 md:px-10 py-12 md:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-8">
            {/* Heritage */}
            <div>
              <Link
                href="/"
                aria-label="Kankana Silks home"
                className="mb-4 inline-flex h-14 w-[160px] items-center"
              >
                <Image
                  src="/removed-bg-logo.png"
                  alt="Kankana Silks"
                  width={316}
                  height={152}
                  sizes="160px"
                  className="
        h-14
        w-auto
        max-w-[160px]
        object-contain
        object-left
        brightness-0
        invert
      "
                />
              </Link>

              <p className="max-w-[200px] text-base leading-relaxed text-brand-on-section/75">
                Celebrating centuries of saree-making tradition with modern
                elegance.
              </p>

              <button
                type="button"
                onClick={() => setStoreLocatorOpen(true)}
                className="
      mt-5 inline-flex min-h-11 items-center gap-2
      rounded-full border border-brand-accent/70
      bg-transparent px-4 py-2
      text-base font-medium text-brand-accent
      transition-colors
      hover:bg-brand-accent hover:text-brand-on-accent
    "
              >
                <MapPin className="h-3.5 w-3.5" />
                Find Our Stores
              </button>
            </div>

            {/* ── Shop ── */}
            <div>
              <h4 className="mb-4 text-base font-futura-bold uppercase tracking-[0.15em] text-brand-on-section">
                {" "}
                Shop
              </h4>
              <ul className="space-y-2.5">
                {footerLinks.Shop.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-base text-brand-on-section/75 transition-colors hover:text-brand-accent"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* ── Connect ── */}
            <div>
              <h4 className="mb-4 text-base font-futura-bold uppercase tracking-[0.15em] text-brand-on-section">
                {" "}
                Connect
              </h4>
              <ul className="space-y-2.5">
                {footerLinks.Connect.map(({ label, href, external }) => (
                  <li key={label}>
                    <a
                      href={href}
                      target={external ? "_blank" : undefined}
                      rel={external ? "noopener noreferrer" : undefined}
                      className="text-base text-brand-on-section/75 transition-colors hover:text-brand-accent"
                    >
                      {label}
                    </a>
                  </li>
                ))}

                {/* Store Locator — also in Connect column */}
                <li>
                  <button
                    onClick={() => setStoreLocatorOpen(true)}
                    className="brand-link flex items-center gap-1.5 text-xs text-gray-500 group"
                  >
                    <MapPin className="w-3 h-3 group-hover:text-brand-accent transition-colors" />
                    Store Locator
                  </button>
                </li>
              </ul>
            </div>

            {/* ── Newsletter ── */}
            <div>
              <h4 className="mb-4 text-base font-futura-bold uppercase tracking-[0.15em] text-brand-on-section">
                {" "}
                Newsletter
              </h4>
              <p className="mb-3 text-base leading-relaxed text-brand-on-section/75">
                New collections and exclusive offers, straight to your inbox.
              </p>
              <form onSubmit={handleNewsletterSubmit} className="flex gap-0">
                <input
                  type="email"
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="min-w-0 flex-1 rounded-l-lg border border-r-0 border-brand-on-section/30 bg-brand-primary-deep/45 px-3 py-2 text-base text-brand-on-section placeholder:text-brand-on-section/60 transition-colors focus:border-brand-accent focus:outline-none"
                />
                <button
                  type="submit"
                  className="brand-gold-button min-h-10 flex-shrink-0 rounded-r-lg rounded-l-none px-4 py-2 text-base"
                >
                  Join
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="border-t border-brand-accent/20 bg-brand-primary-deep/30">
          <div className="max-w-screen-xl mx-auto px-6 md:px-10 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-base text-brand-on-section/75">
              © {new Date().getFullYear()} Kankana Silks. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <Link
                href="/privacy-policy"
                className="text-base text-brand-on-section/75 transition-colors hover:text-brand-accent"
              >
                Privacy
              </Link>
              <Link
                href="/terms-and-conditions"
                className="text-base text-brand-on-section/75 transition-colors hover:text-brand-accent"
              >
                Terms
              </Link>
              {/* Mobile store locator shortcut */}
              <button
                onClick={() => setStoreLocatorOpen(true)}
                className="flex items-center gap-1.5 text-base text-gray-600 transition-colors hover:text-black"
              >
                <MapPin className="h-4 w-4 transition-colors group-hover:text-brand-accent" />{" "}
                Stores
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* ── STORE LOCATOR MODAL ── */}
      <AnimatePresence>
        {storeLocatorOpen && (
          <StoreLocatorModal onClose={() => setStoreLocatorOpen(false)} />
        )}
      </AnimatePresence>
    </>
  );
}
