export interface Product {
  id: string;
  name: string;
  price: number;
  formattedPrice: string;
  image: string;
  images: string[];
  category: string;
  description: string;
  sizes: string[];
  colors: string[];
  details: string[];
  videoUrl?: string;
  status?: string;
}

export const PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "Silk Maxi Dress",
    price: 45000,
    formattedPrice: "₦45,000",
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1596783074918-c84cb06531ca?auto=format&fit=crop&w=800&q=80"
    ],
    category: "Dresses",
    description: "Indulge in pure elegance with our Silk Maxi Dress. Tailored from premium liquid silk, it features a draped neckline and a high side slit, offering a timeless silhouette that flows gracefully with every movement. Ideal for luxury evening events and modern weddings.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Wine Red", "Emerald Green", "Classic Black"],
    details: ["100% Premium Mulberry Silk", "Adjustable spaghetti straps", "Concealed back zipper closure", "Dry clean only"],
  },
  {
    id: "p2",
    name: "Denim Baggy Jeans",
    price: 32000,
    formattedPrice: "₦32,000",
    image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1582562124811-c09040d0a901?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1604176354204-9268737828e4?auto=format&fit=crop&w=800&q=80"
    ],
    category: "Baggy Jeans",
    description: "An effortless nod to vintage streetwear. Engineered with robust medium-weight cotton denim, these baggy jeans offer a comfortable loose fit through the thighs and legs, tapering slightly at the ankle. A perfect blend of street style and everyday comfort.",
    sizes: ["28", "30", "32", "34", "36"],
    colors: ["Light Wash Indigo", "Midnight Black", "Acid Gray"],
    details: ["100% Organic Cotton Denim", "Five-pocket design", "Branded metal buttons", "Machine wash cold inside out"],
  },
  {
    id: "p3",
    name: "Essential Basic Top",
    price: 15000,
    formattedPrice: "₦15,000",
    image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=800&q=80"
    ],
    category: "Basic Tops",
    description: "The ultimate luxury foundation piece. Crafted from a highly breathable ribbed modal-cotton blend, this top offers a second-skin feel and exceptional stretch retention. Featuring a classic crew neck, it coordinates seamlessly with high-waisted denim or structured blazers.",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Optic White", "Charcoal Gray", "Nude Beige"],
    details: ["95% Modal Cotton, 5% Elastane", "Ultra-soft ribbed finish", "Double-stitch hems", "Tumble dry low"],
  },
  {
    id: "p4",
    name: "High-Waist Joggers",
    price: 22000,
    formattedPrice: "₦22,000",
    image: "https://images.unsplash.com/photo-1551799517-eb8f03cb5e6a?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1551799517-eb8f03cb5e6a?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1506152983158-b4a74a01c721?auto=format&fit=crop&w=800&q=80"
    ],
    category: "Joggers",
    description: "Refining off-duty aesthetics. These joggers are cut from an incredibly soft heavyweight French Terry cotton. Designed with a flexible ribbed drawstring waistband, tapered leg contours, and side zippered pockets to keep your items secure during travel or lounging.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Heather Gray", "Oatmeal Beige", "Forest Green"],
    details: ["Heavyweight French Terry Cotton", "Drawstring closure", "Two side pockets, one back pocket", "Pre-shrunk fabric"],
  },
  {
    id: "p5",
    name: "Ankara Print Dress",
    price: 38000,
    formattedPrice: "₦38,000",
    image: "https://images.unsplash.com/photo-1607990283143-e81e7a2c93ab?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1607990283143-e81e7a2c93ab?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1608748010899-18f300247112?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80"
    ],
    category: "Dresses",
    description: "Celebrate heritage with a contemporary outline. Our Ankara Print Dress features high-contrast authentic wax print patterns, dynamic bell sleeves, and a flattering waist cinch. Made with premium breathable cotton to ensure vibrancy and comfort in warmer climates.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Vibrant Pattern"],
    details: ["100% Premium African Wax Cotton", "Flared bell sleeves", "Hidden back zip", "Hand wash or dry clean recommended"],
  },
  {
    id: "p6",
    name: "Silk Cami Top",
    price: 18000,
    formattedPrice: "₦18,000",
    image: "https://images.unsplash.com/photo-1618244972963-dbee1a7edc95?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1618244972963-dbee1a7edc95?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1607990283143-e81e7a2c93ab?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1549064492-ccf369c254e0?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=800&q=80"
    ],
    category: "Basic Tops",
    description: "Graceful elegance in its simplest form. This double-lined silk camisole features a sleek V-neckline and elegant bias cut for a fluid drape. Perfect as a base layer under luxury suits or paired with casual wears for an effortless daytime look.",
    sizes: ["XS", "S", "M", "L"],
    colors: ["Champagne Gold", "Soft Rose", "Ivory White"],
    details: ["100% Mulberry Silk", "Double layered bust padding", "Hypoallergenic breathable material", "Hand wash cold"],
  },
  {
    id: "p7",
    name: "Pleated Maxi Skirt",
    price: 28000,
    formattedPrice: "₦28,000",
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?auto=format&fit=crop&w=800&q=80"
    ],
    category: "Casual Wears",
    description: "Introduce elegant textures to your wardrobe. This pleated maxi skirt features high-density permanent accordion pleats and a soft elasticized waistband for a versatile high or mid-rise fit. Moves beautifully and transitions effortlessly from brunch to dinner.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Caramel Tan", "Navy Blue", "Olive Green"],
    details: ["Flowy chiffon polyester blend", "Permanent accordion pleating", "Comfort elastic waistband", "Machine wash delicate"],
  },
  {
    id: "p8",
    name: "Canvas Tote Bag",
    price: 14000,
    formattedPrice: "₦14,000",
    image: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80"
    ],
    category: "Accessories",
    description: "Your daily functional companion. Crafted from ultra-durable heavy canvas with premium full-grain leather handle accents, this tote bag features a spacious main compartment, a secure inside zip pocket, and water-resistant interior lining for daily utility.",
    sizes: ["OS (One Size)"],
    colors: ["Ecru Natural", "Sage Green", "Charcoal Black"],
    details: ["18oz heavy duty cotton canvas", "Genuine leather hand straps", "Interior zip pocket & keys clip", "Wipe clean with damp cloth"],
  },
  {
    id: "p9",
    name: "Oversized Tee",
    price: 12000,
    formattedPrice: "₦12,000",
    image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80"
    ],
    category: "T-Shirts",
    description: "Relaxed fit and premium heavy cotton feel. Features a slightly dropped shoulder design, durable ribbed collar, and graphic imprint styling for an effortless streetwear aesthetic.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Vibrant Orange", "Off-White", "Washed Black"],
    details: ["100% heavy organic combed cotton", "240 GSM pre-shrunk fabric", "Screen-printed graphics", "Wash inside out with cold water"],
  },
  {
    id: "p10",
    name: "Beaded Necklace",
    price: 8500,
    formattedPrice: "₦8,500",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=800&q=80"
    ],
    category: "Accessories",
    description: "An elegant, handmade accessory to complete your outfits. Strung with authentic polished wood, bone beads, and brass details, this necklace captures rich African textures with modern minimalist styling.",
    sizes: ["OS (One Size)"],
    colors: ["Natural Multi"],
    details: ["Handcrafted wood and brass beads", "Adjustable secure lobster clasp", "Total length: 45cm", "Keep away from perfumes and liquids"],
  },
  {
    id: "p11",
    name: "Silk Evening Dress",
    price: 85000,
    formattedPrice: "₦85,000",
    image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=800&q=80"
    ],
    category: "Dresses",
    description: "Luxurious silk evening dress with a flattering A-line silhouette. Features delicate hand-stitched detailing and a subtle sheen that catches the light beautifully.",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Classic Black", "Beige Tan", "Deep Cocoa", "Warm Cream"],
    details: ["100% Premium liquid silk fabric", "Hand-stitched micro details", "Bias cut for natural body contour", "Dry clean only"],
  },
  {
    id: "p12",
    name: "Leather Crossbody Bag",
    price: 45000,
    formattedPrice: "₦45,000",
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=800&q=80"
    ],
    category: "Accessories",
    description: "Indulge in functional luxury. Tailored from full-grain textured calfskin leather, this crossbody bag offers a compact silhouette, adjustable leather shoulder strap, secure zip pockets, and elegant brushed gold hardware.",
    sizes: ["One Size"],
    colors: ["Brown", "Classic Black", "Oatmeal Beige"],
    details: ["100% Premium Full-grain Calfskin", "Soft canvas lined inner compartment", "Adjustable strap length: 55-65cm", "Made in Nigeria"],
  },
  {
    id: "p13",
    name: "Gold Statement Earrings",
    price: 15000,
    formattedPrice: "₦15,000",
    image: "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80"
    ],
    category: "Accessories",
    description: "Make a striking statement. These sculptural lightweight earrings are plated in high-shine 18k yellow gold, featuring a unique hammered surface that reflects light beautifully for day-to-night elegance.",
    sizes: ["One Size"],
    colors: ["Gold", "Silver"],
    details: ["18k Yellow Gold Plating over Brass", "Hypoallergenic titanium posts", "Ultra lightweight design", "Length: 5.5cm"],
  },
];
