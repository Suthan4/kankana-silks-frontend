"use client";

import React, { useState } from "react";

const ContactUs: React.FC = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  return (
    <div className="bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8">
          Contact Us
        </h1>

        <div className="grid md:grid-cols-2 gap-10">
          {/* Contact Info */}
          <div className="space-y-4 text-gray-700">
            <p>
              We’re here to help. Reach out for order support, product
              inquiries, or any assistance.
            </p>

            <div className="space-y-2">
              <p>
                <strong>Email:</strong> support@kankanasilks.com
              </p>
              {/* <p><strong>Phone:</strong> +91 XXXXX XXXXX</p> */}
              <p>
                <strong>Address:</strong> Kankana Silks, 464, First floor,
                Jayachamarajendra road, 1st Stage, Vijayanagar, Mysore,
                Karnataka
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <form className="space-y-4">
            <input
              type="text"
              placeholder="Your Name"
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900/20"
            />

            <input
              type="email"
              placeholder="Your Email"
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900/20"
            />

            <textarea
              rows={4}
              placeholder="Your Message"
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900/20"
            />

            <button
              type="submit"
              className="bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
