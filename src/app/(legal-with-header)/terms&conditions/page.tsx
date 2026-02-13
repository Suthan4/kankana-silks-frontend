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
              We strive for accurate product images and descriptions. Minor
              variations may occur due to display settings or photography
              lighting.
            </p>
          </section>

          {/* Pricing + GST */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              2. Pricing & GST Transparency
            </h2>

            <p className="mb-2">All product prices include applicable GST.</p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p>GST Structure Applied:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>CGST: 2.5%</li>
                <li>SGST: 2.5%</li>
                <li>Total GST: 5% </li>
              </ul>
            </div>

            <p className="mt-3">
              Shipping charges are shown separately during checkout.
            </p>
          </section>

          {/* Cancellation */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              3. Cancellation Policy
            </h2>

            <ul className="list-disc pl-5 space-y-1">
              <li>Orders can be cancelled before shipment dispatch.</li>
              <li>Once order is shipped, cancellation is not allowed.</li>
              <li>
                After delivery, return request must be raised within 48 hours (2
                days) as per Return Policy.
              </li>
            </ul>
          </section>

          {/* Order Cancellation Rights */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              4. Order Cancellation Rights (Seller)
            </h2>

            <p className="mb-2">
              Kankana Silks reserves the right to cancel orders due to:
            </p>

            <ul className="list-disc pl-5 space-y-1">
              <li>Pricing errors</li>
              <li>Stock mismatch</li>
              <li>Fraud suspicion</li>
              <li>Technical errors</li>
            </ul>
          </section>

          {/* Liability */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              5. Limitation of Liability
            </h2>

            <p>
              Kankana Silks liability shall be limited to product value paid by
              customer.
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
              {/* <p>
                <strong>Phone:</strong>
              </p> */}
              <p>
                <strong>Business Address:</strong> Kankana Silks, 464, First
                floor, Jayachamarajendra road, 1st Stage, Vijayanagar, Mysore,
                Karnataka
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
              These terms shall be governed by laws of India. Jurisdiction:
              Courts of Mysore Karnataka.
            </p>
          </section>

          {/* Disclaimer */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              ⚠️ Legal Disclaimer
            </h2>

            <p>
              Kankana Silks reserves right to modify policies without prior
              notice. Updated policies will be effective immediately upon
              website publication.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
