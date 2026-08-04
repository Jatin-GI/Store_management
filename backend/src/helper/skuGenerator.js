/**
 * Build a unique SKU for any product type.
 * Uses brand + title + attribute values + short random suffix.
 */
function generateSKU(brand, title, attributes = {}) {
  const clean = (value, len) =>
    String(value || "")
      .replace(/[^a-zA-Z0-9]/g, "")
      .substring(0, len)
      .toUpperCase();

  const brandPart = clean(brand || "GEN", 3) || "GEN";
  const titlePart = clean(title || "ITEM", 5) || "ITEM";

  const attrParts = Object.values(attributes || {})
    .filter((v) => v !== null && v !== undefined && String(v).trim() !== "")
    .map((v) => clean(v, 4))
    .filter(Boolean);

  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  const parts = [brandPart, titlePart, ...attrParts, random];

  return parts.join("-");
}

module.exports = generateSKU;
