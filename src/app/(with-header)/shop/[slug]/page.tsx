import { Metadata } from "next";
import { notFound } from "next/navigation";
import axios from "axios";
import CategoryProductsClient from "@/components/categoryProductsClient";

type Props = {
  params: { slug: string };
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// Define Category interface
interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  children?: Category[];
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

// Fetch category data (server-side) - Using axios without localStorage
async function getCategoryBySlug(slug: string): Promise<Category | null> {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/categories/slug/${slug}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.data;
  } catch (error) {
    console.error("Error fetching category:", error);
    return null;
  }
}

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    return {
      title: "Category Not Found | Kankana Silks",
      description: "The category you're looking for could not be found.",
    };
  }

  const title = `${category.name} - Premium Silk Sarees | Kankana Silks`;
  const description =
    category.description ||
    `Explore our exquisite collection of ${category.name.toLowerCase()} at Kankana Silks. Handcrafted traditional silk sarees with authentic artistry and timeless elegance.`;

  return {
    title,
    description,
    keywords: [
      category.name,
      "silk saree",
      "handloom saree",
      "traditional saree",
      "Kankana Silks",
      "pure silk",
      "handcrafted saree",
    ].filter(Boolean),
    openGraph: {
      title,
      description,
      images: category.image
        ? [
            {
              url: category.image,
              width: 1200,
              height: 630,
              alt: category.name,
            },
          ]
        : [],
      type: "website",
      url: `https://kankanasilks.com/category/${slug}`,
      siteName: "Kankana Silks",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: category.image ? [category.image] : [],
    },
    alternates: {
      canonical: `/category/${slug}`,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

// Generate static params for all categories (optional, for static generation)
export async function generateStaticParams() {
  try {
    // Using axios without localStorage
    const response = await axios.get(`${API_BASE_URL}/categories/tree`, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    const categories = response.data.data;

    // Flatten the category tree to get all slugs
    const flattenCategories = (cats: Category[]): string[] => {
      return cats.reduce((acc: string[], cat: Category) => {
        acc.push(cat.slug);
        if (cat.children && cat.children.length > 0) {
          acc.push(...flattenCategories(cat.children));
        }
        return acc;
      }, []);
    };

    const slugs = flattenCategories(categories);

    return slugs.map((slug) => ({
      slug,
    }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

// Main page component
export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  return <CategoryProductsClient category={category} />;
}
