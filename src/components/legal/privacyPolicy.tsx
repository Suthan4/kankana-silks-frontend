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
              1. Information We Collect
            </h2>

            <p className="mb-2">
              We may collect the following information when you use our website:
            </p>

            <ul className="list-disc pl-5 space-y-1">
              <li>Name</li>
              <li>Phone number</li>
              <li>Email address</li>
              <li>Shipping and billing address</li>
              <li>Order and purchase history</li>
              <li>Transaction or payment reference IDs</li>
              <li>
                Device or browser information (for security and analytics)
              </li>
            </ul>
          </section>

          {/* 2 */}
          <section>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
              2. Purpose of Data Collection
            </h2>

            <p className="mb-2">
              Your data is used strictly for legitimate business purposes
              including:
            </p>

            <ul className="list-disc pl-5 space-y-1">
              <li>Processing and fulfilling orders</li>
              <li>Shipping and delivery coordination</li>
              <li>Customer support and communication</li>
              <li>Fraud detection and prevention</li>
              <li>Legal and regulatory compliance</li>
              <li>Improving our services and user experience</li>
            </ul>
          </section>

          {/* 3 */}
          <section>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
              3. Data Sharing & Disclosure
            </h2>

            <p className="mb-2">
              We do not sell or rent your personal data. Information may be
              shared only with:
            </p>

            <ul className="list-disc pl-5 space-y-1">
              <li>Payment gateway providers</li>
              <li>Logistics and delivery partners</li>
              <li>Technology service providers</li>
              <li>Government or legal authorities if required by law</li>
            </ul>
          </section>

          {/* 4 */}
          <section>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
              4. Cookies & Tracking Technologies
            </h2>

            <p>
              We may use cookies and similar technologies to enhance user
              experience, analyze website traffic, and improve our services.
              Users may control cookie settings through their browser
              preferences.
            </p>
          </section>

          {/* 5 */}
          <section>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
              5. Data Security
            </h2>

            <p>
              We implement reasonable security practices and procedures to
              protect your personal data in accordance with the Information
              Technology Act, 2000 and applicable rules. However, no method of
              transmission over the internet is completely secure.
            </p>
          </section>

          {/* 6 */}
          <section>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
              6. Data Retention
            </h2>

            <p>
              We retain personal information only for as long as necessary to
              fulfill business, legal, or regulatory requirements.
            </p>
          </section>

          {/* 7 */}
          <section>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
              7. User Rights
            </h2>

            <p>
              Users may request access, correction, or deletion of their
              personal data by contacting us. We will respond within reasonable
              timeframes as required by applicable law.
            </p>
          </section>

          {/* 8 */}
          <section>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
              8. Third-Party Links
            </h2>

            <p>
              Our website may contain links to third-party websites. We are not
              responsible for the privacy practices or content of those external
              sites.
            </p>
          </section>

          {/* 9 */}
          <section>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
              9. Children's Privacy
            </h2>

            <p>
              Our services are not directed toward individuals under the age of
              18. We do not knowingly collect personal data from children.
            </p>
          </section>

          {/* 10 */}
          <section>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
              10. Policy Updates
            </h2>

            <p>
              We may update this Privacy Policy from time to time. Changes will
              be effective immediately upon posting on the website.
            </p>
          </section>

          {/* 11 */}
          <section>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
              11. Contact Information
            </h2>

            <div className="bg-gray-50 border rounded-lg p-4 space-y-2">
              <p>
                <strong>Business Name:</strong> Kankana Silks
              </p>
              <p>
                <strong>Email:</strong> support@kankanasilks.com
              </p>
              <p>
                <strong>Address:</strong> 464, First Floor, Jayachamarajendra
                Road, 1st Stage, Vijayanagar, Mysore, Karnataka, India
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
