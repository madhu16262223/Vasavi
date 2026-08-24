export const STORE_INFO = {
  name: "Vasavi Fancy Store",
  name_te: "వాసవి ఫ్యాన్సీ స్టోర్",
  owner: "Ramcharan",
  owner_te: "రామ్‌చరణ్ గారు",
  tagline: "Beauty That Defines You ✨",
  tagline_te: "మీ అందానికి అసలైన నిర్వచనం ✨",
  address: "NK Rd, Nadigadda, Telugu peta, Nandyal, Andhra Pradesh 518501",
  address_te: "ఎన్‌కే రోడ్, నదిగడ్డ, తెలుగు పేట, నంద్యాల, ఆంధ్రప్రదేశ్ - 518501",
  whatsappNumber: "918309917665",
  displayPhone: "+91 83099 17665",
  email: "mogalipalliram@gmail.com",
  instagram: "@vasavi_fancy_store_nandyal",
  businessHours: "Mon - Sat: 9:00 AM - 9:30 PM | Sunday: 10:00 AM - 4:00 PM",
  businessHours_te: "సోమ - శని: ఉదయం 9:00 - రాత్రి 9:30 | ఆదివారం: ఉదయం 10:00 - సాయంత్రం 4:00",
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
    name_te: "కాస్మెటిక్స్ & బ్యూటీ",
    slug: "cosmetics",
    description: "Premium lipsticks, matte foundations, eyeliners, and makeup palettes",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80",
    itemCount: 0
  },
  {
    id: "cat-2",
    name: "Jewellery",
    name_te: "టెంపుల్ జ్యువెలరీ",
    slug: "jewellery",
    description: "Temple jewellery, gold plated necklaces, jhumkas, and designer bangles",
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
    itemCount: 0
  },
  {
    id: "cat-3",
    name: "Hand Bags",
    name_te: "డిజైనర్ హ్యాండ్ బ్యాగ్స్",
    slug: "hand-bags",
    description: "Luxury totes, party clutches, bridal potlis, and crossbody bags",
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80",
    itemCount: 0
  },
  {
    id: "cat-4",
    name: "Hair Accessories",
    name_te: "హెయిర్ యాక్సెసరీస్",
    slug: "hair-accessories",
    description: "Bridal hair combs, pearl pins, floral tiaras, and velvet scrunchies",
    image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80",
    itemCount: 0
  },
  {
    id: "cat-5",
    name: "Bangles",
    name_te: "గాజులు & బ్యాంగిల్స్",
    slug: "bangles",
    description: "Traditional gold plated bangles, bridal churi sets, velvet & glass bangles",
    image: "/bangles.jpg",
    itemCount: 0
  },
  {
    id: "cat-6",
    name: "Beauty & Perfumes",
    name_te: "సుగంధ ద్రవ్యాలు & పర్ఫ్యూమ్స్",
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
    name_te: "రాయల్ కుందన్ వెల్వెట్ గాజుల సెట్ (24 ముక్కలు)",
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
    description: "Exquisite 24-piece royal red velvet and 24K gold-plated Kundan bridal bangles set with hanging latkan jhumkis.",
    description_te: "అందమైన 24 ముక్కల రాయల్ రెడ్ వెల్వెట్ మరియు 24K గోల్డ్ ప్లేటెడ్ కుందన్ పెళ్లికూతురి గాజుల సెట్, వేలాడే లట్కన్ జుంకీలతో."
  },
  {
    id: "prod-2",
    name: "Maybelline SuperStay Matte Ink Liquid Lipstick",
    name_te: "మేబెల్లిన్ సూపర్ స్టే మ్యాట్ లిక్విడ్ లిప్‌స్టిక్",
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
    description: "Up to 16-hour saturated liquid matte finish with flawless high-pigment coverage and precision arrow applicator.",
    description_te: "16 గంటల వరకు ఉండే సూపర్ మ్యాట్ ఫినిష్, అద్భుతమైన పిగ్మెంట్ కవరేజ్ మరియు ప్రెసిషన్ బాణం ఆకారపు అప్లికేటర్."
  },
  {
    id: "prod-3",
    name: "Temple Gold Choker Necklace & Jhumkas Set",
    name_te: "టెంపుల్ గోల్డ్ చోకర్ నెక్లెస్ & జుంకీల సెట్",
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
    description: "Traditional 24K gold-microplated temple choker necklace with intricate Goddess Lakshmi embossing and matching royal jhumkas.",
    description_te: "లక్ష్మీ దేవి నగిషీలతో కూడిన సాంప్రదాయ 24K గోల్డ్ మైక్రోప్లేటెడ్ టెంపుల్ చోకర్ నెక్లెస్ మరియు సరిపోయే జుంకీలు."
  },
  {
    id: "prod-4",
    name: "Designer Bridal Floral Hair Comb Tiara",
    name_te: "డిజైనర్ బ్రైడల్ ఫ్లోరల్ హెయిర్ కోంబ్ టియారా",
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
    description: "Handcrafted bridal pearl and gold-plated floral hair comb for traditional south Indian hairstyles.",
    description_te: "దక్షిణ భారత సాంప్రదాయ కేశాలంకరణ కోసం రూపొందించిన చేతితో తయారుచేసిన బ్రైడల్ పెర్ల్ మరియు గోల్డ్ ఫ్లోరల్ హెయిర్ కోంబ్."
  },
  {
    id: "prod-5",
    name: "Luxury Embroidered Bridal Potli Handbag",
    name_te: "లగ్జరీ జర్దోసీ ఎంబ్రాయిడరీ బ్రైడల్ పోట్లీ బ్యాగ్",
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
    description: "Premium velvet bridal potli bag with intricate golden zardosi embroidery, pearl tassels, and drawstring closure.",
    description_te: "గోల్డెన్ జర్దోసీ వర్క్, ముత్యాల కుచ్చులు మరియు డ్రాస్ట్రింగ్ క్లోజర్‌తో కూడిన ప్రీమియం వెల్వెట్ బ్రైడల్ పోట్లీ బ్యాగ్."
  }
];

export const INITIAL_ORDERS = [];



