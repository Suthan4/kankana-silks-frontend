import React from "react";

const ReturnRefundPolicy: React.FC = () => {
  return (
    <div className="w-full bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
          🔄 Return, Replacement & Refund Policy
        </h1>

        <div className="space-y-8 text-sm sm:text-base text-gray-700 leading-relaxed">
          {/* 1 */}
          <section>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
              1. Return Request Window
            </h2>

            <p className="mb-3">
              Customers must raise a return request within{" "}
              <strong>48 hours (2 days)</strong> of delivery.
            </p>

            <p>
              Requests raised beyond this period may be rejected at sole
              discretion of Kankana Silks.
            </p>
          </section>

          {/* 2 */}
          <section>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
              2. Mandatory Verification Process
            </h2>

            <p className="mb-3">
              To prevent misuse and ensure fair resolution:
            </p>

            <p className="mb-2 font-medium">Customer must provide:</p>

            <ul className="list-disc pl-5 space-y-1 mb-3">
              <li>Product images</li>
              <li>Packaging images</li>
              <li>Unboxing video (if available)</li>
            </ul>

            <p>
              Failure to provide verification proof may result in rejection of
              return request.
            </p>
          </section>

          {/* 3 */}
          <section>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
              3. Seller Fault Cases (Kankana Silks Responsibility)
            </h2>

            <p className="mb-2">If verified issue is due to:</p>

            <ul className="list-disc pl-5 space-y-1 mb-3">
              <li>Manufacturing defect</li>
              <li>Wrong product shipped</li>
              <li>Transit damage</li>
              <li>Product not matching description</li>
            </ul>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
              <p className="font-medium text-green-800">
                ✔ Return shipping cost → Paid by Kankana Silks
              </p>
              <p className="font-medium text-green-800">
                ✔ Resolution → Full refund OR replacement
              </p>
            </div>
          </section>

          {/* 4 */}
          <section>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
              4. Customer Fault / Non-Seller Fault Cases
            </h2>

            <p className="mb-2">If return is due to:</p>

            <ul className="list-disc pl-5 space-y-1 mb-3">
              <li>Change of mind</li>
              <li>Expectation mismatch</li>
              <li>Incorrect size selection</li>
              <li>Incorrect address given</li>
            </ul>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-2">
              <p className="font-medium text-yellow-800">
                ✔ Return shipping cost → Paid by Customer
              </p>
              <p className="font-medium text-yellow-800">
                ✔ Refund → Product value only (excluding shipping & return
                shipping)
              </p>
            </div>

            <p className="mt-3">
              Final decision shall be based on internal quality verification by
              Kankana Silks.
            </p>
          </section>

          {/* 5 */}
          <section>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
              5. Non-Returnable Products
            </h2>

            <p className="mb-2">Returns shall not be accepted if:</p>

            <ul className="list-disc pl-5 space-y-1">
              <li>Product is used / washed / altered</li>
              <li>Product damaged after delivery</li>
              <li>Return requested after 48 hours</li>
              <li>Customised / altered products</li>
              <li>Missing tags / original packaging</li>
            </ul>
          </section>

          {/* Color Disclaimer */}
          <section>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
             6. Color & Product Appearance Disclaimer
            </h2>

            <p className="mb-3">
              We make every effort to display product colors as accurately as
              possible. However, due to variations in screen settings, lighting
              conditions, and photography limitations, actual product colors may
              slightly differ from images shown on the website.
            </p>

            <ul className="list-disc pl-5 space-y-1 mb-3">
              <li>Lighting during photography may affect appearance</li>
              <li>Device display settings may cause color variation</li>
              <li>
                Handloom and dyed fabrics may have natural shade variations
              </li>
            </ul>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="font-medium text-blue-800">
                Minor color or texture variations shall not be considered
                defects and will not qualify for return or refund under seller
                fault category.
              </p>
            </div>
          </section>

          {/* 7 */}
          <section>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
              7. Refund Timeline
            </h2>

            <p className="mb-3">
              Approved refunds will be processed within{" "}
              <strong>5–7 business days</strong> after:
            </p>

            <ul className="list-disc pl-5 space-y-1 mb-3">
              <li>Product receipt</li>
              <li>Quality verification</li>
            </ul>

            <p>
              Actual credit timeline depends on customer’s bank or payment
              provider.
            </p>
          </section>

          {/* 8 */}
          <section>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
              8. Payment Processing Fee Deduction
            </h2>

            <p className="mb-3">
              For prepaid online orders, payment gateway / payment processing
              charges are non-refundable in case of approved returns or refunds.
            </p>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-2">
              <p className="font-medium text-red-800">
                ✔ Payment processing / convenience fee may be deducted from the
                refund amount.
              </p>
              <p className="font-medium text-red-800">
                ✔ Refunds will generally include product value (including GST)
                after applicable deductions.
              </p>
            </div>

            <p className="mt-3">
              Cancellation-related deductions are governed separately under our
              Cancellation Policy.
            </p>
          </section>

          {/* 9 */}
          <section>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
              9. Return Address & Store Location
            </h2>

            <div className="bg-gray-50 border rounded-lg p-4 space-y-2">
              <p>
                <strong>Store Name:</strong> Kankana Silks
              </p>
              <p>
                <strong>Store / Warehouse Location:</strong> Kankana Silks, 464,
                First floor, Jayachamarajendra road, 1st Stage, Vijayanagar,
                Mysore, Karnataka India
              </p>
              <p>
                All approved returns must be shipped to our Mysore warehouse
                address shared by our support team after return approval.
              </p>
            </div>

            <p className="mt-3">
              Customers are advised not to send products without prior return
              approval, as such returns may not be accepted.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              10. For Support
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

export default ReturnRefundPolicy;
