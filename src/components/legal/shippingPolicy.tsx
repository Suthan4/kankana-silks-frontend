import React from "react";

const ShippingPolicy: React.FC = () => {
  return (
    <div className="w-full bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-futura-bold text-gray-900 mb-6">
          Shipping & Delivery Policy
        </h1>

        {/* Section */}
        <div className="space-y-8 text-sm sm:text-base text-gray-700 leading-relaxed">
          {/* 1 */}
          <section>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
              1. Order Processing
            </h2>
            <p className="mb-3">
              All orders are processed within <strong>1–3 business days</strong>
              , excluding Sundays and public holidays.
            </p>

            <p className="mb-2">
              Kankana Silks reserves the right to delay or cancel orders in case
              of:
            </p>

            <ul className="list-disc pl-5 space-y-1">
              <li>Stock unavailability</li>
              <li>Payment authorization failure</li>
              <li>Suspected fraudulent transaction</li>
              <li>Force majeure events</li>
            </ul>
          </section>

          {/* 2 */}
          <section>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
              2. Courier Selection & Shipping Charges
            </h2>

            <p className="mb-3">
              Customers are provided the option to select available courier
              partners during checkout.
            </p>

            <p className="mb-2">Shipping charges are calculated based on:</p>

            <ul className="list-disc pl-5 space-y-1 mb-3">
              <li>Courier partner selected</li>
              <li>Delivery destination</li>
              <li>Package actual or volumetric weight</li>
            </ul>

            <p>
              Shipping charges are payable by the customer unless explicitly
              stated otherwise.
            </p>
          </section>

          {/* 3 */}
          <section>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
              3. Logistics Partner
            </h2>

            <p className="mb-3">
              Shipping and delivery services are facilitated through third-party
              logistics aggregators including but not limited to Shiprocket and
              its courier network partners.
            </p>

            <p className="mb-2">Kankana Silks shall not be liable for:</p>

            <ul className="list-disc pl-5 space-y-1">
              <li>Courier transit delays</li>
              <li>Loss caused by incorrect address provided by customer</li>
              <li>
                Natural disasters, strikes, government restrictions, or force
                majeure
              </li>
            </ul>
          </section>

          {/* 4 */}
          <section>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
              4. Delivery Timeline
            </h2>

            <p>
              Estimated delivery timeline: <strong>3–8 business days</strong>{" "}
              post dispatch. Actual delivery timelines may vary based on
              location and courier serviceability.
            </p>
          </section>

          {/* 5 */}
          <section>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
              5. Shipment Tracking
            </h2>

            <p>
              Shipment tracking details will be shared via SMS, Email, or
              WhatsApp (if applicable) once dispatched.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              6. For Support
            </h2>

            <div className="bg-gray-50 border rounded-lg p-4 space-y-2">
              <p>
                <strong>Email:</strong> support@kankanasilks.com
              </p>
              <p>
                <strong>Location:</strong> Kankana Silks, 464, First floor,
                Jayachamarajendra road, 1st Stage, Vijayanagar, Mysore,
                Karnataka
              </p>
              <p>
                All orders are processed and shipped from our Mysore warehouse.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ShippingPolicy;
