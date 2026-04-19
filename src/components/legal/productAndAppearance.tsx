import React from "react";

const ProductDetailsAppearance: React.FC = () => {
  return (
    <div className="w-full bg-white">
      {" "}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
          Product Details & Appearance
        </h1>

        <div className="space-y-8 text-sm sm:text-base text-gray-700 leading-relaxed">
          {/* 1. Color Representation */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              1. Color Representation
            </h2>

            <p className="mb-3">
              We strive to display product colors as accurately as possible.
              However, actual colors may slightly vary due to lighting
              conditions, photography limitations, device screen settings, and
              natural fabric characteristics.
            </p>

            <ul className="list-disc pl-5 space-y-1">
              <li>
                Dark shades such as black, navy blue, maroon, and brown may
                appear similar.
              </li>
              <li>
                Bright shades like red, pink, orange, and purple may look
                different under various lighting conditions.
              </li>
              <li>
                Light colors including white, cream, pastel tones, and neutral
                shades may vary depending on background and illumination.
              </li>
            </ul>

            <p className="mt-3">
              The above examples are indicative only. Similar variations may
              occur with other colors not specifically mentioned here.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-3">
              <p className="font-medium text-blue-800">
                Such color differences are natural and shall not be considered
                defects or grounds for return or refund.
              </p>
            </div>
          </section>

          {/* 2. Fabric & Handloom Variations */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              2. Fabric & Handloom Variations
            </h2>

            <p>
              Many of our products are handcrafted or handwoven. Slight
              irregularities in weave, zari work, thread texture, or pattern are
              inherent characteristics of authentic craftsmanship and should not
              be treated as manufacturing defects.
            </p>
          </section>

          {/* 3. Zari & Texture Appearance */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              3. Zari & Texture Appearance
            </h2>

            <p>
              Zari work, silk threads, and textured fabrics may reflect light
              differently under various lighting conditions. Variations in shine
              or tone are natural and may appear different in photographs
              compared to real-life appearance.
            </p>
          </section>

          {/* 4. Measurements & Fit */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              4. Measurements & Fit
            </h2>

            <p>
              Product measurements mentioned on the website are approximate and
              may have minor variations due to manual measurement processes.
              Such differences shall not be considered defects.
            </p>
          </section>

          {/* 5. Product Description Accuracy */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              5. Product Description Accuracy
            </h2>

            <p>
              We make every effort to ensure accurate product descriptions and
              images. However, minor differences may occur due to updates in
              design, supplier variations, or manufacturing processes.
            </p>
          </section>

          {/* 6. Natural Characteristics Disclaimer */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              6. Natural Characteristics
            </h2>

            <p>
              Variations in color shade, zari tone, thread feel, or fabric
              texture are inherent to textile products and may vary slightly
              from batch to batch. These are natural characteristics and not
              defects.
            </p>
          </section>

          {/* 7. High Value Product Advisory */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              7. High-Value Product Advisory
            </h2>

            <p>
              For high-value products, customers are encouraged to request
              additional photos or video confirmation prior to purchase to
              ensure satisfaction with product appearance.
            </p>
          </section>

          {/* 8. Return Policy Reference */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              8. Return Eligibility
            </h2>

            <p>
              For return eligibility, refund terms, and applicable conditions,
              customers are advised to refer to our Return & Refund Policy.
            </p>
          </section>

          {/* 9. Store Information */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              9. Store Information
            </h2>

            <div className="bg-gray-50 border rounded-lg p-4 space-y-2">
              <p>
                <strong>Store Name:</strong> Kankana Silks
              </p>
              <p>
                <strong>Address:</strong> 464, First Floor, Jayachamarajendra
                Road, 1st Stage, Vijayanagar, Mysore, Karnataka, India
              </p>
            </div>
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

export default ProductDetailsAppearance;
