import React from "react";

const AboutUs: React.FC = () => {
  return (
    <div className="bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl sm:text-4xl font-futura-bold text-gray-900 mb-6">
          About Kankana Silks
        </h1>

        <div className="space-y-6 text-gray-700 text-sm sm:text-base leading-relaxed">
          <p>
            Kankana Silks is a celebration of timeless elegance and traditional
            craftsmanship. We specialize in premium silk sarees that reflect
            heritage, artistry, and modern sophistication.
          </p>

          <p>
            Our collections are thoughtfully curated to bring you the finest
            handcrafted pieces from skilled artisans across India. Each saree
            tells a story of culture, craftsmanship, and dedication.
          </p>

          <p>
            At Kankana Silks, we believe in quality, transparency, and customer
            satisfaction. From secure payments to trusted delivery partners, we
            ensure a seamless shopping experience.
          </p>

          <div className="bg-gray-50 border rounded-lg p-6 mt-8">
            <h2 className="font-semibold text-gray-900 mb-2">Our Mission</h2>
            <p>
              To preserve the legacy of Indian silk traditions while making
              premium sarees accessible worldwide.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
