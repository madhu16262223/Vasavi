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
    name: "Royal Kundan Velvet Bangles Set (24 Pcs)",
    categoryId: "cat-5",
    category: "Bangles",
    categoryName: "Bangles",
    price: 499,
    originalPrice: 799,
    stock: 25,
    image: "/bangles.jpg",
    imageUrl: "/bangles.jpg",
    brand: "Vasavi Bridal Collection",
    isTrending: true,
    isBestSeller: true,
    rating: 4.9,
    reviewsCount: 142,
    description: "Exquisite 24-piece royal red velvet and 24K gold-plated Kundan bridal bangles set with hanging latkan jhumkis."
  },
  {
    id: "prod-2",
    name: "Maybelline SuperStay Matte Ink Liquid Lipstick",
    categoryId: "cat-1",
    category: "Cosmetics",
    categoryName: "Cosmetics",
    price: 299,
    originalPrice: 399,
    stock: 35,
    image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=800&q=80",
    imageUrl: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=800&q=80",
    brand: "Maybelline New York",
    shade: "Ruby Red (20 Pioneer)",
    isTrending: true,
    isBestSeller: true,
    rating: 4.8,
    reviewsCount: 98,
    description: "Up to 16-hour saturated liquid matte finish with flawless high-pigment coverage and precision arrow applicator."
  },
  {
    id: "prod-3",
    name: "Temple Gold Choker Necklace & Jhumkas Set",
    categoryId: "cat-2",
    category: "Jewellery",
    categoryName: "Jewellery",
    price: 850,
    originalPrice: 1200,
    stock: 18,
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
    imageUrl: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
    brand: "Vasavi Royal Jewellery",
    isTrending: true,
    isBestSeller: true,
    rating: 4.9,
    reviewsCount: 115,
    description: "Traditional 24K gold-microplated temple choker necklace with intricate Goddess Lakshmi embossing and matching royal jhumkas."
  },
  {
    id: "prod-4",
    name: "Designer Bridal Floral Hair Comb Tiara",
    categoryId: "cat-4",
    category: "Hair Accessories",
    categoryName: "Hair Accessories",
    price: 349,
    originalPrice: 499,
    stock: 20,
    image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80",
    imageUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80",
    brand: "Vasavi Bridal Hair",
    isTrending: false,
    isBestSeller: true,
    rating: 4.7,
    reviewsCount: 64,
    description: "Handcrafted bridal pearl and gold-plated floral hair comb for traditional south Indian hairstyles."
  },
  {
    id: "prod-5",
    name: "Luxury Embroidered Bridal Potli Handbag",
    categoryId: "cat-3",
    category: "Hand Bags",
    categoryName: "Hand Bags",
    price: 599,
    originalPrice: 899,
    stock: 15,
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80",
    imageUrl: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80",
    brand: "Vasavi Boutique",
    isTrending: true,
    isBestSeller: false,
    rating: 4.8,
    reviewsCount: 82,
    description: "Premium velvet bridal potli bag with intricate golden zardosi embroidery, pearl tassels, and drawstring closure."
  }
];

export const INITIAL_ORDERS = [];


