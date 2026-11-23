import { motion } from "framer-motion";
import type { Category } from "@/lib/api/category.api";
import PriceRangeSlider from "@/components/ui/PriceRangeSlider";

interface CategoryFilterSidebarProps {
  category: Category;
  isMobile?: boolean;
  selectedSubCategory: string | null;
  onSubCategoryChange: (subCategoryId: string | null) => void;
  onClearFilters: () => void;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  materials: readonly string[];
  selectedFabric: string[];
  onFabricChange: (material: string) => void;
}

export function CategoryFilterSidebar({
  category,
  isMobile = false,
  selectedSubCategory,
  onSubCategoryChange,
  onClearFilters,
  priceRange,
  onPriceRangeChange,
  materials,
  selectedFabric,
  onFabricChange,
}: CategoryFilterSidebarProps) {
  return (
    <motion.div
      initial={false}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`${isMobile ? "p-6" : ""}`}
    >
      <div className="mb-6">
        <button
          type="button"
          onClick={onClearFilters}
          className="brand-link text-sm font-medium"
        >
          Clear All Filters
        </button>
      </div>

      {category.children && category.children.length > 0 && (
        <div className="mb-6">
          <h3 className="mb-4 font-semibold text-gray-900">Subcategories</h3>
          <ul className="space-y-2">
            <motion.li
              whileTap={{ scale: 0.98 }}
              onClick={() => onSubCategoryChange(null)}
              className={`cursor-pointer rounded-lg px-3 py-2 transition-colors ${
                selectedSubCategory === null
                  ? "bg-brand-primary-soft font-medium text-brand-primary"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              All {category.name}
            </motion.li>
            {category.children.map((subCategory) => (
              <motion.li
                key={subCategory.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSubCategoryChange(subCategory.id)}
                className={`cursor-pointer rounded-lg px-3 py-2 transition-colors ${
                  selectedSubCategory === subCategory.id
                    ? "bg-brand-primary-soft font-medium text-brand-primary"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {subCategory.name}
              </motion.li>
            ))}
          </ul>
        </div>
      )}

      <div className="mb-6">
        <h3 className="mb-4 font-semibold text-gray-900">Price Range</h3>
        <div className="space-y-4">
          <PriceRangeSlider
            value={priceRange}
            min={0}
            max={100000}
            step={500}
            onChange={onPriceRangeChange}
          />
        </div>
      </div>

      <div className="mb-6">
        <h3 className="mb-4 font-semibold text-gray-900">Fabric</h3>
        <ul className="space-y-2">
          {materials.map((material) => (
            <motion.li
              key={material}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2"
            >
              <input
                type="checkbox"
                checked={selectedFabric.includes(material)}
                onChange={() => onFabricChange(material)}
                className="h-4 w-4 accent-main-primary"
              />
              <label className="cursor-pointer text-gray-700">
                {material}
              </label>
            </motion.li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}
