import React from "react";

const TermsAndConditions: React.FC = () => {
  return (
    <div className="w-full bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
          📜 Terms & Conditions
        </h1>

        <div className="space-y-8 text-sm sm:text-base text-gray-700 leading-relaxed">
          {/* Product */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              1. Product Representation
            </h2>

            <p>
              We strive to ensure that all product images and descriptions are
              accurate. However, minor variations may occur due to display
              settings, lighting conditions, or the handcrafted nature of
              products.
            </p>

            <p className="mt-2">
              Detailed information regarding product appearance, color
              variation, and expectations is available in our{" "}
              <strong>Product Details & Appearance Policy</strong>.
            </p>
          </section>

          {/* Pricing + GST */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              2. Pricing & GST Transparency
            </h2>

            <p className="mb-2">
              All product prices displayed on the website include applicable GST
              as per Indian taxation laws.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="font-medium">GST Structure Applied:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>CGST: 2.5%</li>
                <li>SGST: 2.5%</li>
                <li>IGST: 5% (Applicable for inter-state orders)</li>
              </ul>
            </div>

            <p className="mt-3">
              Shipping charges, if applicable, are displayed separately during
              checkout.
            </p>
          </section>

          {/* Cancellation */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              3. Cancellation Policy
            </h2>

            <p>
              Order cancellations are governed by our{" "}
              <strong>Cancellation Policy</strong>. Customers are advised to
              review the policy before placing an order.
            </p>

            <p className="mt-2">
              Once an order has been shipped, cancellation is not permitted.
            </p>
          </section>

          {/* Returns */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              4. Returns & Refunds
            </h2>

            <p>
              Returns and refunds are subject to our{" "}
              <strong>Return & Refund Policy</strong>. Customers must raise
              return requests within the timeframe mentioned in that policy
              after delivery.
            </p>
          </section>

          {/* Shipping */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              5. Shipping Policy
            </h2>

            <p>
              Shipping timelines, delivery conditions, and charges are governed
              by our <strong>Shipping Policy</strong>.
            </p>
          </section>

          {/* Seller Cancellation */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              6. Order Cancellation Rights (Seller)
            </h2>

            <p className="mb-2">
              Kankana Silks reserves the right to cancel any order due to:
            </p>

            <ul className="list-disc pl-5 space-y-1">
              <li>Pricing or typographical errors</li>
              <li>Stock unavailability or mismatch</li>
              <li>Fraud suspicion or payment issues</li>
              <li>Technical or system errors</li>
            </ul>
          </section>

          {/* Liability */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              7. Limitation of Liability
            </h2>

            <p>
              Kankana Silks shall not be liable for any indirect, incidental, or
              consequential damages arising from the use of our products or
              services. Liability, if any, shall be limited to the amount paid
              by the customer for the purchased product.
            </p>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              8. Intellectual Property
            </h2>

            <p>
              All website content including images, logos, designs, text, and
              graphics are the intellectual property of Kankana Silks and may
              not be copied, reproduced, or used without written permission.
            </p>
          </section>

          {/* User Responsibility */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              9. User Responsibilities
            </h2>

            <p>
              Customers agree to provide accurate and complete information while
              placing orders. Kankana Silks shall not be responsible for delays
              or delivery failures caused by incorrect customer details.
            </p>
          </section>

          {/* Grievance */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              🧾 Grievance Redressal Mechanism
            </h2>

            <div className="bg-gray-50 border rounded-lg p-4 space-y-2">
              <p>
                <strong>Customer Support:</strong> support@kankanasilks.com
              </p>
              <p>
                <strong>Business Address:</strong> Kankana Silks, 464, First
                Floor, Jayachamarajendra Road, 1st Stage, Vijayanagar, Mysore,
                Karnataka, India
              </p>
            </div>

            <p className="mt-3">
              All complaints will be acknowledged and resolved within reasonable
              timelines as per applicable law.
            </p>
          </section>

          {/* Law */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              ⚖️ Governing Law
            </h2>

            <p>
              These terms shall be governed by the laws of India. Jurisdiction:
              Courts of Mysore, Karnataka.
            </p>
          </section>

          {/* Disclaimer */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              ⚠️ Legal Disclaimer
            </h2>

            <p>
              Kankana Silks reserves the right to modify these terms and related
              policies at any time without prior notice. Updated versions will
              become effective immediately upon publication on the website.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
