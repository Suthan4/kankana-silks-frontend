/**
 * Validates CSS named colors only.
 *
 * Valid:
 * red
 * yellow
 * darkblue
 * lightgreen
 *
 * Invalid:
 * #ff0000
 * rgb(255, 0, 0)
 * hsl(0, 100%, 50%)
 */
export const isValidCSSColorName = (color: unknown): boolean => {
  if (typeof color !== "string") return false;

  const normalized = color.trim().toLowerCase();

  if (!normalized) return false;

  // Reject hex and functional color values.
  if (
    normalized.startsWith("#") ||
    normalized.startsWith("rgb(") ||
    normalized.startsWith("rgba(") ||
    normalized.startsWith("hsl(") ||
    normalized.startsWith("hsla(") ||
    normalized.startsWith("oklch(") ||
    normalized.startsWith("lab(") ||
    normalized.startsWith("color(") ||
    normalized.startsWith("var(")
  ) {
    return false;
  }

  // Named CSS colors don't contain numbers or special characters.
  if (!/^[a-z]+$/.test(normalized)) return false;

  if (typeof CSS !== "undefined" && CSS.supports) {
    return CSS.supports("color", normalized);
  }

  // Fallback for environments where CSS.supports is unavailable.
  if (typeof document !== "undefined") {
    const element = document.createElement("span");
    element.style.color = "";
    element.style.color = normalized;

    return element.style.color !== "";
  }

  return false;
};

/**
 * Normalizes a color name for storage and comparison.
 *
 * " Red " -> "red"
 * "DARKBLUE" -> "darkblue"
 */
export const normalizeColorText = (color: string): string => {
  return color.trim().toLowerCase();
};

/**
 * Converts CSS-style color names into readable text.
 *
 * "darkblue" -> "Dark Blue"
 * "lightgoldenrodyellow" -> "Light Goldenrod Yellow"
 */
export const formatColorText = (color: string): string => {
  const normalized = normalizeColorText(color);

  const words = normalized
    .replace(/light/g, "light ")
    .replace(/dark/g, "dark ")
    .replace(/medium/g, "medium ")
    .replace(/deep/g, "deep ")
    .replace(/pale/g, "pale ")
    .replace(/slate/g, "slate ")
    .replace(/sky/g, "sky ")
    .replace(/sea/g, "sea ")
    .replace(/spring/g, "spring ")
    .replace(/goldenrod/g, "goldenrod ")
    .replace(/violet/g, "violet ")
    .replace(/green/g, "green ")
    .replace(/blue/g, "blue ")
    .replace(/yellow/g, "yellow ")
    .replace(/gray/g, "gray ")
    .replace(/grey/g, "grey ")
    .replace(/\s+/g, " ")
    .trim();

  return words.replace(/\b\w/g, (letter) => letter.toUpperCase());
};

/**
 * Validates and returns normalized color text.
 */
export const validateColorWithText = (
  color: string,
): {
  isValid: boolean;
  normalized: string;
  displayText: string;
} => {
  const normalized = normalizeColorText(color);
  const isValid = isValidCSSColorName(normalized);

  return {
    isValid,
    normalized,
    displayText: isValid ? formatColorText(normalized) : color.trim(),
  };
};

/**
 * Checks whether an attribute represents a color.
 */
export const isColorTextAttribute = (key: string): boolean => {
  const normalizedKey = key.trim().toLowerCase();

  return ["color", "colour", "shade", "hue", "tint"].includes(normalizedKey);
};