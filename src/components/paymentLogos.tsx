import Image from "next/image";

export default function PaymentLogos({ type }: { type: string }) {
  const logoMap: Record<string, string[]> = {
    UPI: [
      "/payimg/googlepay.svg",
      "/payimg/phonepe.svg",
      "/payimg/cred_circle.png",
      "/payimg/amazonpay.svg",
    ],
    CARD: [
      "/payimg/visa.jpeg",
      "/payimg/mastercard.png",
      "/payimg/rupay.png",
    ],
    WALLET: [
      "/payimg/paytm.jpg",
      "/payimg/amazonpay.svg",
    ],
    PAYLATER: [
      "/payimg/simpl.svg",
    //   "/payimg/lazypay.svg",
      "/payimg/amazonpay.svg",
    ],
  };

  const logos = logoMap[type] || [];

  if (!logos.length) return null;

  return (
    <div className="flex items-center gap-2 mt-2 flex-wrap">
      {logos.map((src, i) => (
        <div
          key={i}
          className="bg-white border border-gray-200 rounded px-2 py-1 flex items-center justify-center"
        >
          <Image
            src={src}
            alt="payment"
            width={36}
            height={20}
            className="object-contain h-4 w-auto"
          />
        </div>
      ))}
    </div>
  );
}
