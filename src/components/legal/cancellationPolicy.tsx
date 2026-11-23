import React from "react";

const CancellationPolicy: React.FC = () => {
  return (
    <div className="w-full bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-2xl sm:text-3xl font-futura-bold text-gray-900 mb-6">
          Order Cancellation Policy
        </h1>

        <div className="space-y-8 text-sm sm:text-base text-gray-700 leading-relaxed">
          {/* 1 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              1. Cancellation Before Shipment
            </h2>

            <p className="mb-3">
              Orders can be cancelled before dispatch confirmation. If you
              need to request a cancellation, contact our support team as soon
              as possible and share your order number so the order status can
              be checked.
            </p>
            <p className="mb-3">
              A cancellation request is subject to the order not having been
              shipped. Please wait for confirmation from Kankana Silks before
              treating an order as cancelled.
            </p>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="font-medium text-yellow-800">
                Payment processing / payment gateway charges are non-refundable
                in case of cancellation.
              </p>
            </div>
          </section>

          {/* 2 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              2. Cancellation After Shipment
            </h2>

            <p>
              Once an order has been shipped from our warehouse, cancellation is
              not allowed.
            </p>
          </section>

          {/* 3 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              3. Refund for Cancelled Orders
            </h2>

            <p className="mb-3">
              Approved cancellations will be refunded after deducting applicable
              payment processing charges.
            </p>

            <ul className="list-disc pl-5 space-y-1">
              <li>Refund timeline: 5–7 business days</li>
              <li>Bank processing time may vary</li>
            </ul>
          </section>

          {/* 4 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              4. Seller Cancellation Rights
            </h2>

            <p>Kankana Silks reserves the right to cancel orders due to:</p>

            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Stock unavailability</li>
              <li>Pricing errors</li>
              <li>Fraud suspicion</li>
              <li>Technical issues</li>
            </ul>
          </section>

          {/* 5 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              5. Store Information
            </h2>

            <div className="bg-gray-50 border rounded-lg p-4 space-y-2">
              <p>
                <strong>Store Name:</strong> Kankana Silks
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

          {/* 6 */}
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

export default CancellationPolicy;
