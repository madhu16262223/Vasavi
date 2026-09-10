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

    // 0. If product explicitly has variants disabled by admin
    if (product.hasVariants === false) {
      result.push({ ...product, hasVariants: false, variants: [] });
      continue;
    }

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

/**
 * Intelligent Smart Variant Generator
 * Automatically generates appropriate, realistic Flipkart/Amazon style variants for ANY product
 */
export function generateSmartVariantsForProduct(product) {
  if (!product) return [];
  const pName = (product.name || '').toLowerCase();
  const cat = (product.categoryName || product.category || product.categoryId || '').toLowerCase();
  const basePrice = typeof product.price === 'number' ? product.price : (parseFloat(product.price) || 299);
  const baseOrig = product.originalPrice ? (parseFloat(product.originalPrice) || Math.round(basePrice * 1.35)) : Math.round(basePrice * 1.35);
  const stock = product.stock || 15;

  // 1. Bangles (Traditional Sizes)
  if (pName.includes('bangle') || cat.includes('bangle')) {
    return [
      { id: `${product.id}-v24`, name: '2.4 (Small)', price: basePrice, originalPrice: baseOrig, stock: Math.max(5, Math.floor(stock * 0.4)) },
      { id: `${product.id}-v26`, name: '2.6 (Medium)', price: basePrice, originalPrice: baseOrig, stock: stock },
      { id: `${product.id}-v28`, name: '2.8 (Large)', price: Math.round(basePrice * 1.1), originalPrice: Math.round(baseOrig * 1.1), stock: Math.max(5, Math.floor(stock * 0.5)) }
    ];
  }

  // 2. Creams, Lotions, Powders, Foundations, Face Care (Weights)
  if (pName.includes('cream') || pName.includes('lotion') || pName.includes('powder') || pName.includes('fairness') || pName.includes('wash') || pName.includes('gel')) {
    return [
      { id: `${product.id}-v15`, name: '15g (Travel Pack)', price: Math.round(basePrice * 0.5), originalPrice: Math.round(baseOrig * 0.5), stock: 20 },
      { id: `${product.id}-v30`, name: '30g (Regular)', price: basePrice, originalPrice: baseOrig, stock: stock },
      { id: `${product.id}-v50`, name: '50g (Value Pack)', price: Math.round(basePrice * 1.55), originalPrice: Math.round(baseOrig * 1.55), stock: 12 }
    ];
  }

  // 3. Perfumes, Rose Water, Oils, Toners, Mists, Sprays (Volumes)
  if (pName.includes('perfume') || pName.includes('water') || pName.includes('oil') || pName.includes('mist') || pName.includes('spray') || pName.includes('shampoo') || cat.includes('perfume')) {
    return [
      { id: `${product.id}-v50m`, name: '50 ml', price: Math.round(basePrice * 0.65), originalPrice: Math.round(baseOrig * 0.65), stock: 18 },
      { id: `${product.id}-v100m`, name: '100 ml (Regular)', price: basePrice, originalPrice: baseOrig, stock: stock },
      { id: `${product.id}-v200m`, name: '200 ml (Family Pack)', price: Math.round(basePrice * 1.7), originalPrice: Math.round(baseOrig * 1.7), stock: 10 }
    ];
  }

  // 4. Lipsticks, Liners, Kajal, Compacts (Shades / Combos)
  if (pName.includes('lipstick') || pName.includes('kajal') || pName.includes('liner') || pName.includes('mascara') || pName.includes('compact') || cat.includes('cosmetic')) {
    const defaultShade = product.shade || 'Classic Red';
    return [
      { id: `${product.id}-vsh1`, name: defaultShade, price: basePrice, originalPrice: baseOrig, stock: stock },
      { id: `${product.id}-vsh2`, name: 'Velvet Nude', price: basePrice, originalPrice: baseOrig, stock: 15 },
      { id: `${product.id}-vsh3`, name: 'Combo (Set of 2)', price: Math.round(basePrice * 1.85), originalPrice: Math.round(baseOrig * 1.85), stock: 8 }
    ];
  }

  // 5. Jewellery, Necklaces, Chokers, Earrings, Jhumkas
  if (pName.includes('necklace') || pName.includes('choker') || pName.includes('jhumka') || pName.includes('earring') || cat.includes('jewel')) {
    return [
      { id: `${product.id}-vj1`, name: 'Standard Set', price: basePrice, originalPrice: baseOrig, stock: stock },
      { id: `${product.id}-vj2`, name: 'Grand Set (+ Maang Tikka)', price: Math.round(basePrice * 1.35), originalPrice: Math.round(baseOrig * 1.35), stock: 8 }
    ];
  }

  // 6. Bags, Clutches, Potlis
  if (pName.includes('bag') || pName.includes('potli') || pName.includes('clutch') || cat.includes('bag')) {
    return [
      { id: `${product.id}-vb1`, name: 'Medium (Regular)', price: basePrice, originalPrice: baseOrig, stock: stock },
      { id: `${product.id}-vb2`, name: 'Large (Grand)', price: Math.round(basePrice * 1.35), originalPrice: Math.round(baseOrig * 1.35), stock: 10 }
    ];
  }

  // 7. Hair Accessories, Combs, Flowers, Pins
  if (pName.includes('comb') || pName.includes('hair') || pName.includes('pin') || pName.includes('flower') || cat.includes('hair')) {
    return [
      { id: `${product.id}-vh1`, name: '1 Piece', price: basePrice, originalPrice: baseOrig, stock: stock },
      { id: `${product.id}-vh2`, name: 'Pair (Set of 2)', price: Math.round(basePrice * 1.8), originalPrice: Math.round(baseOrig * 1.8), stock: 12 },
      { id: `${product.id}-vh3`, name: 'Bridal Set (Pack of 4)', price: Math.round(basePrice * 3.2), originalPrice: Math.round(baseOrig * 3.2), stock: 8 }
    ];
  }

  // 8. General Default (Packs / Sizes)
  return [
    { id: `${product.id}-v1`, name: 'Single Item / 1 Pc', price: basePrice, originalPrice: baseOrig, stock: stock },
    { id: `${product.id}-v2`, name: 'Medium / Combo Pack', price: Math.round(basePrice * 1.4), originalPrice: Math.round(baseOrig * 1.4), stock: 15 },
    { id: `${product.id}-v3`, name: 'Large / Pack of 3', price: Math.round(basePrice * 2.2), originalPrice: Math.round(baseOrig * 2.2), stock: 10 }
  ];
}

/**
 * 1-Click Variant Presets for Admin Product Editor
 */
export const VARIANT_PRESET_TEMPLATES = [
  {
    id: 'bangles',
    label: '🏷️ Bangles (2.4, 2.6, 2.8)',
    getVariants: (price, orig) => [
      { id: `var-${Date.now()}-1`, name: '2.4 (Small)', price: price || 499, originalPrice: orig || 799, stock: 15 },
      { id: `var-${Date.now()}-2`, name: '2.6 (Medium)', price: price || 499, originalPrice: orig || 799, stock: 25 },
      { id: `var-${Date.now()}-3`, name: '2.8 (Large)', price: Math.round((price || 499) * 1.1), originalPrice: Math.round((orig || 799) * 1.1), stock: 12 }
    ]
  },
  {
    id: 'weights',
    label: '⚖️ Weights (15g, 30g, 50g)',
    getVariants: (price, orig) => [
      { id: `var-${Date.now()}-1`, name: '15g (Small)', price: Math.round((price || 200) * 0.5), originalPrice: Math.round((orig || 300) * 0.5), stock: 20 },
      { id: `var-${Date.now()}-2`, name: '30g (Regular)', price: price || 200, originalPrice: orig || 300, stock: 25 },
      { id: `var-${Date.now()}-3`, name: '50g (Value Pack)', price: Math.round((price || 200) * 1.55), originalPrice: Math.round((orig || 300) * 1.55), stock: 15 }
    ]
  },
  {
    id: 'volumes',
    label: '🧴 Volumes (50ml, 100ml, 200ml)',
    getVariants: (price, orig) => [
      { id: `var-${Date.now()}-1`, name: '50 ml', price: Math.round((price || 250) * 0.65), originalPrice: Math.round((orig || 350) * 0.65), stock: 20 },
      { id: `var-${Date.now()}-2`, name: '100 ml', price: price || 250, originalPrice: orig || 350, stock: 25 },
      { id: `var-${Date.now()}-3`, name: '200 ml', price: Math.round((price || 250) * 1.7), originalPrice: Math.round((orig || 350) * 1.7), stock: 15 }
    ]
  },
  {
    id: 'sizes',
    label: '👗 Sizes (S, M, L, XL)',
    getVariants: (price, orig) => [
      { id: `var-${Date.now()}-1`, name: 'Small (S)', price: price || 399, originalPrice: orig || 599, stock: 15 },
      { id: `var-${Date.now()}-2`, name: 'Medium (M)', price: price || 399, originalPrice: orig || 599, stock: 25 },
      { id: `var-${Date.now()}-3`, name: 'Large (L)', price: Math.round((price || 399) * 1.1), originalPrice: Math.round((orig || 599) * 1.1), stock: 20 },
      { id: `var-${Date.now()}-4`, name: 'XL', price: Math.round((price || 399) * 1.15), originalPrice: Math.round((orig || 599) * 1.15), stock: 10 }
    ]
  },
  {
    id: 'combos',
    label: '🎁 Combos (1 Pc, Set of 2, Grand Set)',
    getVariants: (price, orig) => [
      { id: `var-${Date.now()}-1`, name: 'Single Item (1 Pc)', price: price || 499, originalPrice: orig || 699, stock: 20 },
      { id: `var-${Date.now()}-2`, name: 'Pair (Set of 2)', price: Math.round((price || 499) * 1.85), originalPrice: Math.round((orig || 699) * 1.85), stock: 15 },
      { id: `var-${Date.now()}-3`, name: 'Grand Set (Pack of 3)', price: Math.round((price || 499) * 2.7), originalPrice: Math.round((orig || 699) * 2.7), stock: 8 }
    ]
  }
];
