"use client";

export default function SplashScreen({ show }: { show: boolean }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white">
      <img
        src="/image-removebg-preview.png"
        alt="Kankana Silks"
        className="
          w-auto
          animate-pulse
          h-24        /* small mobiles */
          sm:h-32     /* large mobiles */
          md:h-40     /* tablets */
          lg:h-48     /* laptops */
          xl:h-56     /* large screens */
        "
      />
    </div>
  );
}
