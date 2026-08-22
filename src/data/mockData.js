export const STORE_INFO = {
  name: "Vasavi Fancy Store",
  owner: "Ramcharan",
  tagline: "Beauty That Defines You ✨",
  address: "NK Rd, Nadigadda, Telugu peta, Nandyal, Andhra Pradesh 518501",
  whatsappNumber: "918309917665",
  displayPhone: "+91 83099 17665",
  email: "mogalipalliram@gmail.com",
  instagram: "@vasavi_fancy_store_nandyal",
  businessHours: "Mon - Sat: 9:00 AM - 9:30 PM | Sunday: 10:00 AM - 4:00 PM",
  developer: {
    name: "K. Madhu",
    phone: "+91 97043 81790",
    rawPhone: "919704381790",
    email: "gurumadhukgm@gmail.com"
  }
};

export const INITIAL_CATEGORIES = [
  {
    id: "cat-1",
    name: "Cosmetics",
    slug: "cosmetics",
    description: "Premium lipsticks, matte foundations, eyeliners, and makeup palettes",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80",
    itemCount: 0
  },
  {
    id: "cat-2",
    name: "Jewellery",
    slug: "jewellery",
    description: "Temple jewellery, gold plated necklaces, jhumkas, and designer bangles",
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
    itemCount: 0
  },
  {
    id: "cat-3",
    name: "Hand Bags",
    slug: "hand-bags",
    description: "Luxury totes, party clutches, bridal potlis, and crossbody bags",
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80",
    itemCount: 0
  },
  {
    id: "cat-4",
    name: "Hair Accessories",
    slug: "hair-accessories",
    description: "Bridal hair combs, pearl pins, floral tiaras, and velvet scrunchies",
    image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80",
    itemCount: 0
  },
  {
    id: "cat-5",
    name: "Bangles",
    slug: "bangles",
    description: "Traditional gold plated bangles, bridal churi sets, velvet & glass bangles",
    image: "/bangles.jpg",
    itemCount: 0
  },
  {
    id: "cat-6",
    name: "Beauty & Perfumes",
    slug: "beauty-perfumes",
    description: "Luxury fragrances, body mists, skincare serums, and rose water toners",
    image: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=800&q=80",
    itemCount: 0
  }
];

export const INITIAL_PRODUCTS = [
  {
    id: "prod-1",
    name: "Blue Heaven Pearl Glow Compact Powder (SPF 15 PA+++)",
    categoryId: "cat-1",
    categoryName: "Cosmetics",
    price: 249,
    originalPrice: 349,
    stock: 25,
    rating: 4.9,
    reviewsCount: 18,
    image: "/blue_heaven_compact_powder.png",
    description: "Blue Heaven Pearl Glow Compact Powder infused with SPF 15 PA+++ and Vitamin E. Provides a flawless radiant finish that is lightweight, long-lasting, and controls excess shine for smooth, glowing skin.",
    shade: "Radiant Pearl / Natural Glow",
    brand: "Blue Heaven",
    isTrending: true,
    isBestSeller: true
  }
];

export const INITIAL_ORDERS = [
  {
    id: "ord-101",
    orderNumber: "VSV-62717",
    customerName: "K. Madhu",
    customerPhone: "9704381790",
    customerAddress: "Nandyal Main Road, Beside Gandhi Statue, Nandyal - 518501",
    address: "Nandyal Main Road, Beside Gandhi Statue, Nandyal - 518501",
    notes: "Please pack with gift wrap and call before delivery",
    totalAmount: 325,
    status: "PENDING",
    paymentMethod: "WHATSAPP",
    paymentStatus: "UNPAID",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    items: [
      {
        id: "item-101",
        productId: "prod-rakhi-2",
        productName: "Premium Designer Kundan Rakhi Set",
        quantity: 1,
        price: 325,
        subtotal: 325
      }
    ]
  },
  {
    id: "ord-102",
    orderNumber: "VSV-48192",
    customerName: "Sowmya Reddy",
    customerPhone: "9876543210",
    customerAddress: "Srinagar Colony, Street 4, Nandyal - 518501",
    address: "Srinagar Colony, Street 4, Nandyal - 518501",
    notes: "Urgent delivery needed before evening",
    totalAmount: 1899,
    status: "CONFIRMED",
    paymentMethod: "WHATSAPP",
    paymentStatus: "PAID",
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 20).toISOString(),
    items: [
      {
        id: "item-102",
        productId: "prod-2",
        productName: "24K Gold Plated Antique Temple Necklace Set",
        quantity: 1,
        price: 1899,
        subtotal: 1899
      }
    ]
  }
];

