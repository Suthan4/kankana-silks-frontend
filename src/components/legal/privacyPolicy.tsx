import React from "react";

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="w-full bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
          🔒 Privacy Policy
        </h1>

        <div className="space-y-8 text-sm sm:text-base text-gray-700 leading-relaxed">
          {/* 1 */}
          <section>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
              1. Information Collected
            </h2>

            <p className="mb-2">We may collect:</p>

            <ul className="list-disc pl-5 space-y-1">
              <li>Name</li>
              <li>Phone number</li>
              <li>Email address</li>
              <li>Shipping address</li>
              <li>Order history</li>
              <li>Transaction reference IDs</li>
            </ul>
          </section>

          {/* 2 */}
          <section>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
              2. Purpose of Data Use
            </h2>

            <p className="mb-2">Used strictly for:</p>

            <ul className="list-disc pl-5 space-y-1">
              <li>Order processing</li>
              <li>Shipping coordination</li>
              <li>Customer service</li>
              <li>Fraud prevention</li>
              <li>Legal compliance</li>
            </ul>
          </section>

          {/* 3 */}
          <section>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
              3. Data Sharing
            </h2>

            <p className="mb-2">Data may be shared only with:</p>

            <ul className="list-disc pl-5 space-y-1">
              <li>Payment gateway providers</li>
              <li>Logistics partners</li>
              <li>Government authorities (if legally required)</li>
            </ul>
          </section>

          {/* 4 */}
          <section>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
              4. Data Security
            </h2>

            <p>
              We follow reasonable security practices as per IT Act 2000 and
              applicable data protection standards.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
