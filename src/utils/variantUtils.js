/**
 * Variant Utilities for Vasavi Fancy Store
 * Handles Flipkart / Amazon style Size, Weight, and Quantity variants
 */

// Regular expressions to detect weights, volumes, sizes, and quantities in product titles
const VARIANT_PATTERNS = [
  // Weights: 14g, 25 g, 50gm, 100 gms, 1kg, 500 mg
  /\b(\d+(?:\.\d+)?\s*(?:g|gm|gms|gram|grams|kg|kgs|kilo|mg))\b/i,
  // Volumes: 30ml, 125 ml, 100ml, 1l, 1.5 ltr
  /\b(\d+(?:\.\d+)?\s*(?:ml|milliliter|l|ltr|liter|litres))\b/i,
  // Pieces / Packs: Pack of 2, 24 pcs, Set of 12, 6 pieces, 24 ముక్కలు
  /\b(?:pack\s*of\s*\d+|\d+\s*(?:pcs|pc|pieces|piece|pairs|pair|set|sets))\b/i,
  // Apparel / Bangles / Standard Sizes: S, M, L, XL, XXL, 2.4, 2.6, 2.8 (bangle sizes), Size 2-4
  /\b(?:size\s*[:\-]?\s*(?:[smlxl]+|\d+(?:\.\d+)?))\b/i,
  // Standalone sizes in brackets: (16g), (NATURAL N, 30 ml), (24 ముక్కలు)
  /\(([^)]*(?:g|gm|ml|kg|pcs|size)[^)]*)\)/i
];

/**
 * Parses a product name to extract its base name and detected variant label
 */
export function extractVariantFromTitle(title = '') {
  if (!title || typeof title !== 'string') {
    return { baseName: title || 'Product', variantName: null };
  }

  let cleaned = title.trim();
  let matchedVariant = null;

  for (const pattern of VARIANT_PATTERNS) {
    const match = cleaned.match(pattern);
    if (match) {
      matchedVariant = (match[1] || match[0]).trim();
      // Remove variant from base title
      cleaned = cleaned.replace(match[0], '').replace(/\s{2,}/g, ' ').replace(/[-•|,()]\s*$/, '').trim();
      break;
    }
  }

  // Clean trailing punctuation or dangling brackets
  cleaned = cleaned.replace(/[-•|,()]\s*$/, '').trim();

  return {
    baseName: cleaned || title,
    variantName: matchedVariant
  };
}

/**
 * Automatically groups a list of products by base name or explicit variants
 * So items like "Glow and Lovely 14g", "25g", "50g" become 1 card with 3 selectable pills!
 */
export function groupProductsWithVariants(products = []) {
  if (!Array.isArray(products) || products.length === 0) return [];

  const groupedMap = new Map();
  const result = [];

  for (const product of products) {
    if (!product) continue;

    // 1. If product ALREADY has explicit variants configured by admin
    if (Array.isArray(product.variants) && product.variants.length > 0) {
      result.push(product);
      continue;
    }

    // 2. Otherwise, check for auto-grouping by base name & category
    const { baseName, variantName } = extractVariantFromTitle(product.name);
    const categoryKey = product.categoryId || product.categoryName || 'cat';
    
    // Grouping key: normalized base name + category
    const normalizedBase = baseName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const groupKey = `${categoryKey}_${normalizedBase}`;

    if (variantName && normalizedBase.length > 3) {
      if (!groupedMap.has(groupKey)) {
        // Create initial grouped entry
        const baseProduct = {
          ...product,
          id: product.id,
          name: baseName, // Cleaned title without "14g"
          variants: [
            {
              id: `${product.id}-var`,
              productId: product.id,
              name: variantName,
              price: typeof product.price === 'number' ? product.price : (parseFloat(product.price) || 0),
              originalPrice: product.originalPrice ? (parseFloat(product.originalPrice) || null) : null,
              stock: product.stock ?? 10,
              image: product.image || product.imageUrl
            }
          ]
        };
        groupedMap.set(groupKey, baseProduct);
      } else {
        // Add variant to existing grouped product
        const existing = groupedMap.get(groupKey);
        const alreadyHasVariant = existing.variants.some(
          (v) => v.name.toLowerCase() === variantName.toLowerCase()
        );

        if (!alreadyHasVariant) {
          existing.variants.push({
            id: `${product.id}-var`,
            productId: product.id,
            name: variantName,
            price: typeof product.price === 'number' ? product.price : (parseFloat(product.price) || 0),
            originalPrice: product.originalPrice ? (parseFloat(product.originalPrice) || null) : null,
            stock: product.stock ?? 10,
            image: product.image || product.imageUrl
          });

          // Sort variants by price ascending (14g -> 25g -> 50g)
          existing.variants.sort((a, b) => a.price - b.price);

          // Update base price to lowest variant price
          existing.price = existing.variants[0].price;
          existing.originalPrice = existing.variants[0].originalPrice;
        }
      }
    } else {
      // Standalone product without size variations
      result.push(product);
    }
  }

  // Combine grouped products with non-grouped products
  for (const groupedProd of groupedMap.values()) {
    // If only 1 variant was found and no siblings matched, restore original title if preferred
    if (groupedProd.variants.length === 1 && !products.some(p => p.id !== groupedProd.id && p.name.includes(groupedProd.name))) {
      groupedProd.name = products.find(p => p.id === groupedProd.id)?.name || groupedProd.name;
    }
    result.push(groupedProd);
  }

  return result;
}

/**
 * Returns active variant for a product
 */
export function getActiveVariant(product, selectedVariantIdOrName) {
  if (!product || !Array.isArray(product.variants) || product.variants.length === 0) {
    return null;
  }

  if (!selectedVariantIdOrName) {
    return product.variants[0];
  }

  const found = product.variants.find(
    (v) => v.id === selectedVariantIdOrName || v.name === selectedVariantIdOrName
  );

  return found || product.variants[0];
}

/**
 * Returns effective pricing & stock for a product given a selected variant
 */
export function getEffectiveProductDetails(product, selectedVariant) {
  if (!product) {
    return { price: 0, originalPrice: null, stock: 0, discountPct: null, variantName: null };
  }

  const variant = selectedVariant || (Array.isArray(product.variants) && product.variants.length > 0 ? product.variants[0] : null);

  const price = variant && typeof variant.price === 'number' 
    ? variant.price 
    : (typeof product.price === 'number' ? product.price : (parseFloat(product.price) || 0));

  const rawOriginal = variant && variant.originalPrice !== undefined 
    ? variant.originalPrice 
    : product.originalPrice;

  const originalPrice = rawOriginal ? (parseFloat(rawOriginal) || null) : null;
  const stock = variant && variant.stock !== undefined ? variant.stock : (product.stock ?? 10);

  const discountPct = originalPrice && originalPrice > price
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : null;

  return {
    price,
    originalPrice,
    stock,
    discountPct,
    variantName: variant?.name || null,
    variantId: variant?.id || null
  };
}
