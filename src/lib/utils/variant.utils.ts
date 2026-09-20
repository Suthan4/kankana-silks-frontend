export interface VariantAttribute {
  key: string;
  value: string;
}

/**
 * Safely extracts normalized variant attributes and values from a variant object.
 * Supports:
 * - Direct fields: color, size, fabric
 * - Dynamic attributes: object { key: value }, array [{ key, value }], or JSON string
 * - Deduplicates case-insensitively
 * - Formats display keys cleanly (e.g. "color" -> "Color")
 * - Handles null, undefined, and empty objects gracefully
 */
export function extractVariantAttributes(variant: any): VariantAttribute[] {
  if (!variant || typeof variant !== "object") return [];

  const attributesMap = new Map<string, { key: string; value: string }>();

  const addAttr = (rawKey: string, rawVal: any) => {
    if (rawVal === null || rawVal === undefined) return;
    const strVal = String(rawVal).trim();
    if (!strVal) return;

    const trimmedKey = String(rawKey).trim();
    if (!trimmedKey) return;

    const normalizedKey = trimmedKey.toLowerCase();

    // Format display key nicely (capitalize first letter if all lowercase)
    let displayKey = trimmedKey;
    if (displayKey === displayKey.toLowerCase()) {
      displayKey = displayKey.charAt(0).toUpperCase() + displayKey.slice(1);
    }

    if (!attributesMap.has(normalizedKey)) {
      attributesMap.set(normalizedKey, { key: displayKey, value: strVal });
    }
  };

  // 1. Dynamic attributes
  let attrs = variant.attributes;
  if (typeof attrs === "string") {
    try {
      attrs = JSON.parse(attrs);
    } catch {
      attrs = null;
    }
  }

  if (attrs && typeof attrs === "object") {
    if (Array.isArray(attrs)) {
      for (const item of attrs) {
        if (item && typeof item === "object") {
          if (item.key && item.value !== undefined) {
            addAttr(item.key, item.value);
          } else if (item.name && item.value !== undefined) {
            addAttr(item.name, item.value);
          }
        }
      }
    } else {
      for (const [k, v] of Object.entries(attrs)) {
        addAttr(k, v);
      }
    }
  }

  // 2. Standard / legacy fields (Color, Size, Fabric)
  if (variant.color) addAttr("Color", variant.color);
  if (variant.size) addAttr("Size", variant.size);
  if (variant.fabric) addAttr("Fabric", variant.fabric);

  return Array.from(attributesMap.values());
}

