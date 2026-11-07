export type CitySeoEntry = {
  city: string;
  state: string;
  slug: string;
  title: string;
  description: string;
  heading: string;
  intro: string;
  market: "primary" | "metro" | "regional";
  focus: string;
};

export const citySeoEntries: CitySeoEntry[] = [
  {
    city: "Mumbai", state: "Maharashtra", slug: "mumbai",
    title: "Premium Sarees Online in Mumbai | Kankana Silks",
    description: "Explore Kankana Silks' online collection of traditional silk, wedding and occasion sarees from Mumbai. Check product details and delivery serviceability at checkout.",
    heading: "Discover premium sarees online in Mumbai",
    intro: "Explore traditional Indian saree collections from Kankana Silks, a Mysore-based saree retailer. Browse available silk, wedding and occasion styles online, and confirm delivery options for your Mumbai address at checkout.",
    market: "metro", focus: "Designer, silk and occasion sarees",
  },
  {
    city: "Delhi NCR", state: "Delhi NCR", slug: "delhi-ncr",
    title: "Traditional & Bridal Sarees Online in Delhi NCR | Kankana Silks",
    description: "Browse traditional, bridal and silk saree collections online from Kankana Silks in Delhi NCR. Check current delivery availability at checkout.",
    heading: "Explore traditional and bridal sarees in Delhi NCR",
    intro: "Discover saree styles for weddings, celebrations and special occasions from Kankana Silks. Browse current product listings and confirm delivery serviceability for your Delhi NCR address during checkout.",
    market: "metro", focus: "Bridal, wedding and traditional sarees",
  },
  {
    city: "Pune", state: "Maharashtra", slug: "pune",
    title: "Premium Silk Sarees Online in Pune | Kankana Silks",
    description: "Discover premium silk, traditional and wedding sarees online in Pune from Kankana Silks. Check product availability and delivery options at checkout.",
    heading: "Shop traditional saree collections online in Pune",
    intro: "Browse available silk, traditional and occasion sarees from Kankana Silks. Explore product details online and confirm delivery options for your Pune address at checkout.",
    market: "metro", focus: "Premium silk and wedding sarees",
  },
  {
    city: "Kolkata", state: "West Bengal", slug: "kolkata",
    title: "Traditional & Banarasi Sarees Online in Kolkata | Kankana Silks",
    description: "Explore traditional, Banarasi and silk saree collections online from Kankana Silks in Kolkata. Check delivery serviceability at checkout.",
    heading: "Explore traditional sarees online in Kolkata",
    intro: "Discover traditional Indian saree styles for celebrations and special occasions. Browse available Banarasi, silk and other collections from Kankana Silks, and confirm delivery options for your Kolkata address at checkout.",
    market: "metro", focus: "Traditional, Banarasi and silk sarees",
  },
  {
    city: "Ahmedabad", state: "Gujarat", slug: "ahmedabad",
    title: "Traditional & Wedding Sarees Online in Ahmedabad | Kankana Silks",
    description: "Browse traditional, wedding and silk saree collections online in Ahmedabad from Kankana Silks. Confirm delivery serviceability at checkout.",
    heading: "Discover traditional sarees online in Ahmedabad",
    intro: "Explore available sarees for weddings, festivals and family celebrations from Kankana Silks. Check product details and confirm delivery serviceability for your Ahmedabad address during checkout.",
    market: "metro", focus: "Traditional and wedding sarees",
  },
  {
    city: "Jaipur", state: "Rajasthan", slug: "jaipur",
    title: "Traditional & Wedding Sarees Online in Jaipur | Kankana Silks",
    description: "Explore traditional, silk and wedding saree collections online in Jaipur from Kankana Silks. Check delivery options at checkout.",
    heading: "Explore traditional saree collections in Jaipur",
    intro: "Browse sarees for festive occasions, weddings and celebrations from Kankana Silks. Product-specific details and delivery serviceability for Jaipur are confirmed during checkout.",
    market: "metro", focus: "Wedding and festive sarees",
  },
  {
    city: "Indore", state: "Madhya Pradesh", slug: "indore",
    title: "Premium Sarees Online in Indore | Kankana Silks",
    description: "Discover silk, traditional and wedding sarees online in Indore from Kankana Silks. Check current delivery availability at checkout.",
    heading: "Discover sarees for every occasion in Indore",
    intro: "Explore the current Kankana Silks online collection for traditional, wedding and festive occasions. Review product details and confirm delivery serviceability for your Indore address at checkout.",
    market: "regional", focus: "Traditional and occasion sarees",
  },
  {
    city: "Bhopal", state: "Madhya Pradesh", slug: "bhopal",
    title: "Traditional Sarees Online in Bhopal | Kankana Silks",
    description: "Browse traditional silk and occasion sarees online in Bhopal from Kankana Silks. Confirm delivery options at checkout.",
    heading: "Browse traditional sarees online in Bhopal",
    intro: "Explore available saree collections for weddings, festivals and family occasions from Kankana Silks. Delivery options for Bhopal are confirmed using your address at checkout.",
    market: "regional", focus: "Silk and traditional sarees",
  },
  {
    city: "Lucknow", state: "Uttar Pradesh", slug: "lucknow",
    title: "Traditional & Wedding Sarees Online in Lucknow | Kankana Silks",
    description: "Explore traditional, silk and wedding sarees online in Lucknow from Kankana Silks. Check delivery serviceability at checkout.",
    heading: "Explore traditional sarees online in Lucknow",
    intro: "Discover available saree styles for weddings and special occasions from Kankana Silks. Review product details and confirm delivery serviceability for your Lucknow address during checkout.",
    market: "regional", focus: "Traditional and wedding sarees",
  },
  {
    city: "Coimbatore", state: "Tamil Nadu", slug: "coimbatore",
    title: "Silk Sarees Online in Coimbatore | Kankana Silks",
    description: "Explore silk, traditional and wedding sarees online in Coimbatore from Kankana Silks. Check delivery availability at checkout.",
    heading: "Discover silk sarees online in Coimbatore",
    intro: "Browse available silk and traditional saree collections from Kankana Silks for weddings, festivals and celebrations. Confirm delivery options for your Coimbatore address at checkout.",
    market: "regional", focus: "Silk, bridal and traditional sarees",
  },
  {
    city: "Madurai", state: "Tamil Nadu", slug: "madurai",
    title: "Traditional Silk Sarees Online in Madurai | Kankana Silks",
    description: "Shop traditional silk and wedding sarees online in Madurai from Kankana Silks. Confirm delivery availability at checkout.",
    heading: "Explore traditional silk sarees online in Madurai",
    intro: "Discover sarees for weddings, festivals and family occasions from Kankana Silks. Browse current product listings and confirm delivery serviceability for Madurai at checkout.",
    market: "regional", focus: "Traditional silk and wedding sarees",
  },
  {
    city: "Tiruchirappalli", state: "Tamil Nadu", slug: "tiruchirappalli",
    title: "Silk & Wedding Sarees Online in Tiruchirappalli | Kankana Silks",
    description: "Explore silk, traditional and wedding sarees online in Tiruchirappalli from Kankana Silks. Check delivery options at checkout.",
    heading: "Browse saree collections online in Tiruchirappalli",
    intro: "Explore the current Kankana Silks collection for traditional and occasion wear. Product availability and delivery options for Tiruchirappalli are confirmed at checkout.",
    market: "regional", focus: "Silk and wedding sarees",
  },
  {
    city: "Salem", state: "Tamil Nadu", slug: "salem",
    title: "Traditional Sarees Online in Salem | Kankana Silks",
    description: "Browse silk, traditional and wedding sarees online in Salem from Kankana Silks. Check delivery serviceability at checkout.",
    heading: "Discover traditional sarees online in Salem",
    intro: "Browse sarees for weddings, festivals and special occasions from Kankana Silks. Confirm delivery serviceability for your Salem address during checkout.",
    market: "regional", focus: "Traditional and occasion sarees",
  },
  {
    city: "Erode", state: "Tamil Nadu", slug: "erode",
    title: "Silk Sarees Online in Erode | Kankana Silks",
    description: "Explore silk and traditional sarees online in Erode from Kankana Silks. Check delivery availability at checkout.",
    heading: "Explore silk sarees online in Erode",
    intro: "Discover available traditional and silk saree styles from Kankana Silks. Review product information and confirm delivery serviceability for Erode at checkout.",
    market: "regional", focus: "Silk and traditional sarees",
  },
  {
    city: "Kochi", state: "Kerala", slug: "kochi",
    title: "Traditional & Silk Sarees Online in Kochi | Kankana Silks",
    description: "Discover traditional, silk and occasion sarees online in Kochi from Kankana Silks. Confirm delivery availability at checkout.",
    heading: "Discover traditional sarees online in Kochi",
    intro: "Explore available saree collections for celebrations, weddings and special occasions from Kankana Silks. Confirm delivery options for your Kochi address at checkout.",
    market: "regional", focus: "Traditional and occasion sarees",
  },
  {
    city: "Thiruvananthapuram", state: "Kerala", slug: "thiruvananthapuram",
    title: "Silk & Traditional Sarees Online in Thiruvananthapuram | Kankana Silks",
    description: "Browse traditional silk and wedding sarees online in Thiruvananthapuram from Kankana Silks. Check delivery serviceability at checkout.",
    heading: "Browse traditional sarees online in Thiruvananthapuram",
    intro: "Explore the current online collection from Kankana Silks for weddings and celebrations. Delivery options for your address are confirmed at checkout.",
    market: "regional", focus: "Silk and wedding sarees",
  },
  {
    city: "Mangaluru", state: "Karnataka", slug: "mangaluru",
    title: "Traditional Silk Sarees Online in Mangaluru | Kankana Silks",
    description: "Explore silk and traditional sarees online in Mangaluru from Kankana Silks. Check delivery serviceability at checkout.",
    heading: "Explore traditional sarees online in Mangaluru",
    intro: "Browse available silk and traditional sarees for weddings and special occasions from Kankana Silks. Confirm delivery options for Mangaluru at checkout.",
    market: "regional", focus: "Silk and traditional sarees",
  },
  {
    city: "Hubballi", state: "Karnataka", slug: "hubballi",
    title: "Traditional Sarees Online in Hubballi | Kankana Silks",
    description: "Discover silk and occasion sarees online in Hubballi from Kankana Silks. Check delivery serviceability at checkout.",
    heading: "Discover saree collections online in Hubballi",
    intro: "Explore the current Kankana Silks collection for weddings, festivals and celebrations. Confirm delivery availability for your Hubballi address at checkout.",
    market: "regional", focus: "Traditional and occasion sarees",
  },
  {
    city: "Vijayawada", state: "Andhra Pradesh", slug: "vijayawada",
    title: "Silk & Wedding Sarees Online in Vijayawada | Kankana Silks",
    description: "Browse traditional silk and wedding sarees online in Vijayawada from Kankana Silks. Confirm delivery availability at checkout.",
    heading: "Explore traditional sarees online in Vijayawada",
    intro: "Discover available silk and traditional saree collections from Kankana Silks for weddings and celebrations. Check delivery serviceability for Vijayawada at checkout.",
    market: "regional", focus: "Silk and wedding sarees",
  },
  {
    city: "Visakhapatnam", state: "Andhra Pradesh", slug: "visakhapatnam",
    title: "Traditional Sarees Online in Visakhapatnam | Kankana Silks",
    description: "Explore traditional silk and occasion sarees online in Visakhapatnam from Kankana Silks. Check delivery options at checkout.",
    heading: "Discover traditional sarees online in Visakhapatnam",
    intro: "Browse the current Kankana Silks online collection for weddings, festivals and special occasions. Confirm delivery options for Visakhapatnam at checkout.",
    market: "regional", focus: "Traditional and occasion sarees",
  },
  {
    city: "Bhubaneswar", state: "Odisha", slug: "bhubaneswar",
    title: "Traditional Silk Sarees Online in Bhubaneswar | Kankana Silks",
    description: "Browse traditional and silk sarees online in Bhubaneswar from Kankana Silks. Check delivery serviceability at checkout.",
    heading: "Explore traditional sarees online in Bhubaneswar",
    intro: "Discover available traditional saree styles for celebrations and weddings from Kankana Silks. Confirm delivery serviceability for Bhubaneswar at checkout.",
    market: "regional", focus: "Traditional and silk sarees",
  },
  {
    city: "Guwahati", state: "Assam", slug: "guwahati",
    title: "Traditional Sarees Online in Guwahati | Kankana Silks",
    description: "Explore traditional, silk and occasion sarees online in Guwahati from Kankana Silks. Check delivery availability at checkout.",
    heading: "Discover traditional sarees online in Guwahati",
    intro: "Browse current saree collections from Kankana Silks for weddings and special occasions. Delivery serviceability for Guwahati is confirmed at checkout.",
    market: "regional", focus: "Traditional and silk sarees",
  },
  {
    city: "Nagpur", state: "Maharashtra", slug: "nagpur",
    title: "Silk & Traditional Sarees Online in Nagpur | Kankana Silks",
    description: "Discover silk and traditional sarees online in Nagpur from Kankana Silks. Check delivery serviceability at checkout.",
    heading: "Explore traditional sarees online in Nagpur",
    intro: "Browse available saree collections for celebrations and special occasions from Kankana Silks. Confirm delivery options for Nagpur at checkout.",
    market: "regional", focus: "Silk and traditional sarees",
  },
  {
    city: "Nashik", state: "Maharashtra", slug: "nashik",
    title: "Traditional Sarees Online in Nashik | Kankana Silks",
    description: "Explore silk, traditional and wedding sarees online in Nashik from Kankana Silks. Check delivery serviceability at checkout.",
    heading: "Discover traditional sarees online in Nashik",
    intro: "Explore available sarees for weddings, festivals and family celebrations from Kankana Silks. Confirm delivery options for Nashik at checkout.",
    market: "regional", focus: "Traditional and wedding sarees",
  },
  {
    city: "Chandigarh", state: "Chandigarh", slug: "chandigarh",
    title: "Premium & Wedding Sarees Online in Chandigarh | Kankana Silks",
    description: "Browse premium, silk and wedding sarees online in Chandigarh from Kankana Silks. Check delivery availability at checkout.",
    heading: "Explore premium sarees online in Chandigarh",
    intro: "Discover saree collections for weddings and special occasions from Kankana Silks. Review product details and confirm delivery serviceability for Chandigarh at checkout.",
    market: "regional", focus: "Premium and wedding sarees",
  },
];

export const primaryCityLinks = [
  { city: "Mysuru", href: "/mysore-sarees", note: "Our store city", market: "primary" as const },
  { city: "Bengaluru", href: "/bengaluru-sarees", note: "Priority online market", market: "primary" as const },
];

export const legacyCityLinks = [
  { city: "Chennai", href: "/chennai-sarees", note: "Online collection" },
  { city: "Hyderabad", href: "/hyderabad-sarees", note: "Online collection" },
];

export const cityHref = (slug: string) => `/sarees-in/${slug}`;
