"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function Footer() {
  const links = [
    { label: "About Us", href: "/about-us" },
    { label: "Contact", href: "/contact-us" },
    { label: "Returns", href: "/return-policy" },
    { label: "Shipping", href: "/shipping-policy" },
    { label: "FAQ", href: "/faq" },
  ];
  const socialMedia = [
    {
      label: "Instagram",
      href: "https://www.instagram.com/kankanasilks/?hl=en",
    },
    { label: "Youtube", href: "https://www.youtube.com/@KankanaSilks" },
  ];

  return (
    <footer className="bg-white py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: false }}
          >
            <h3 className="text-lg font-light mb-4 text-foreground">
              Heritage
            </h3>
            <p className="text-sm text-muted-foreground font-light leading-relaxed">
              Celebrating centuries of saree-making tradition with modern
              elegance.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: false }}
          >
            <h3 className="text-lg font-light mb-4 text-foreground">Shop</h3>
            <ul className="space-y-2">
              {links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    scroll={true}
                    className="text-sm text-muted-foreground hover:text-foreground font-light transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: false }}
          >
            <h3 className="text-lg font-light mb-4 text-foreground">Connect</h3>
            <div className="space-y-2 text-sm text-muted-foreground font-light">
              <ul className="space-y-2">
                {socialMedia.map((link) => {
                  return(
                    <li key={link.label}>
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground hover:text-foreground font-light transition-colors"
                      >
                        {link.label}
                      </a>
                    </li>
                  )
                })}
              </ul>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: false }}
          >
            <h3 className="text-lg font-light mb-4 text-foreground">
              Newsletter
            </h3>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-3 py-2 bg-background text-foreground text-sm rounded-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent"
              />
              <button className="px-4 py-2 bg-accent text-accent-foreground rounded-sm hover:opacity-90 transition-all text-sm font-medium">
                Join
              </button>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: false }}
          className="border-t border-border pt-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-center text-xs text-muted-foreground font-light">
            <p>&copy; 2026 Kankana Silks. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <Link
                href="/privacy-policy"
                className="hover:text-foreground transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="/terms&conditions"
                className="hover:text-foreground transition-colors"
              >
                Terms
              </Link>
              {/* <Link
                href="#"
                className="hover:text-foreground transition-colors"
              >
                Cookies
              </Link> */}
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
