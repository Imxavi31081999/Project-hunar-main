/* ============================================================
   PRODUCT DATA - single source of truth for the home page sliders,
   the product wall, the lightbox and the catalogue page.
   After editing, run:  python tools/build_seo.py
   (regenerates the static catalogue HTML, structured data and sitemap)
   ============================================================ */
const madhubaniItems = [
  { src: "assets/img/products/madhubani/madhubani-art-on-saree.webp", label: "Saree", cat: "Madhubani Art" },
  { src: "assets/img/products/madhubani/madhubani-art-on-saree-variant.webp", label: "Saree — Variant", cat: "Madhubani Art" },
  { src: "assets/img/products/madhubani/madhubani-art-on-shirt.webp", label: "Shirt", cat: "Madhubani Art" },
  { src: "assets/img/products/madhubani/madhubani-art-on-shoes.webp", label: "Shoes", cat: "Madhubani Art" },
  { src: "assets/img/products/madhubani/madhubani-art-on-jeans.webp", label: "Jeans", cat: "Madhubani Art" },
  { src: "assets/img/products/madhubani/madhubani-art-on-silk-fabric.webp", label: "Silk Fabric", cat: "Madhubani Art" },
  { src: "assets/img/products/madhubani/madhubani-art-on-cotton-fabric.webp", label: "Cotton Fabric", cat: "Madhubani Art" },
  { src: "assets/img/products/madhubani/madhubani-art-on-jute-fabric.webp", label: "Jute Fabric", cat: "Madhubani Art" },
  { src: "assets/img/products/madhubani/madhubani-art-on-table-lamp.webp", label: "Table Lamp", cat: "Madhubani Art" },
  { src: "assets/img/products/madhubani/madhubani-art-on-wall-board.webp", label: "Wall Board", cat: "Madhubani Art" },
  { src: "assets/img/products/madhubani/madhubani-art-on-pen-stand.webp", label: "Pen Stand", cat: "Madhubani Art" },
  { src: "assets/img/products/madhubani/madhubani-art-on-mobile-cover.webp", label: "Mobile Cover", cat: "Madhubani Art" },
  { src: "assets/img/products/madhubani/madhubani-art-on-photo-frame.webp", label: "Photo Frame", cat: "Madhubani Art" },
  { src: "assets/img/products/madhubani/madhubani-art-on-bedsheets.webp", label: "Bedsheets", cat: "Madhubani Art" },
  { src: "assets/img/products/madhubani/madhubani-art-on-coffee-mug.webp", label: "Coffee Mug", cat: "Madhubani Art" },
  { src: "assets/img/products/madhubani/madhubani-art-on-cushion.webp", label: "Cushion", cat: "Madhubani Art" },
  { src: "assets/img/products/madhubani/madhubani-art-on-diary.webp", label: "Diary", cat: "Madhubani Art" }
];

const handmadeItems = [
  { src: "assets/img/products/crochet/crochet-tote-sunflower-granny-square.webp", label: "Crochet Tote — Sunflower Granny Square", cat: "Crochet Bags" },
  { src: "assets/img/products/crochet/crochet-tote-sunflower-with-strawberry-charm.webp", label: "Crochet Tote — Sunflower with Strawberry Charm", cat: "Crochet Bags" },
  { src: "assets/img/products/crochet/crochet-tote-red-sunflower.webp", label: "Crochet Tote — Red Sunflower", cat: "Crochet Bags" },
  { src: "assets/img/products/crochet/crochet-hobo-bag-cream-with-red-roses.webp", label: "Crochet Hobo Bag — Cream with Red Roses", cat: "Crochet Bags" },
  { src: "assets/img/products/crochet/crochet-hobo-bag-beige-with-pink-roses.webp", label: "Crochet Hobo Bag — Beige with Pink Roses", cat: "Crochet Bags" },
  { src: "assets/img/products/pouches/cosmetic-pouch-peach-floral.webp", label: "Cosmetic Pouch — Peach Floral", cat: "Pouches" },
  { src: "assets/img/products/pouches/cosmetic-pouch-blue-elephant.webp", label: "Cosmetic Pouch — Blue Elephant", cat: "Pouches" },
  { src: "assets/img/products/pouches/cosmetic-pouch-sage-green.webp", label: "Cosmetic Pouch — Sage Green", cat: "Pouches" },
  { src: "assets/img/products/bags/tote-bag-peach-floral.webp", label: "Tote Bag — Peach Floral", cat: "Bags" },
  { src: "assets/img/products/home/bolster-cushion-sage-green.webp", label: "Bolster Cushion — Sage Green", cat: "Home & Cushions" },
  { src: "assets/img/products/home/cushion-cover-ruffled-border.webp", label: "Cushion Cover — Ruffled Border", cat: "Home & Cushions" },
  { src: "assets/img/products/crochet/crochet-sunflower.webp", label: "Crochet Sunflower", cat: "Crochet" },
  { src: "assets/img/products/crochet/crochet-tulip.webp", label: "Crochet Tulip", cat: "Crochet" },
  { src: "assets/img/products/garments/hooded-puffer-jacket.webp", label: "Hooded Puffer Jacket", cat: "Garments" },
  { src: "assets/img/products/crochet/elephant-toy.webp", label: "Elephant toy", cat: "Crochet" },
  { src: "assets/img/products/accessories/hair-rubber-band.webp", label: "Hair Rubber Band", cat: "Accessories" },
  { src: "assets/img/products/bags/laptop-bag-light-orange-floral.webp", label: "Laptop Bag — Light Orange Floral", cat: "Bags" },
  { src: "assets/img/products/bags/laptop-bag-ocean-green-floral.webp", label: "Laptop Bag — Ocean Green Floral", cat: "Bags" },
  { src: "assets/img/products/bags/laptop-bag-red-floral.webp", label: "Laptop Bag — Red Floral", cat: "Bags" },
  { src: "assets/img/products/bags/laptop-bag-blue-grid.webp", label: "Laptop Bag — Blue Grid", cat: "Bags" },
  { src: "assets/img/products/bags/laptop-bag-pink-grid.webp", label: "Laptop Bag — Pink Grid", cat: "Bags" },
  { src: "assets/img/products/pouches/cosmetic-pouch-ocean-green-floral-grid.webp", label: "Cosmetic Pouch — Ocean Green Floral Grid", cat: "Pouches" },
  { src: "assets/img/products/pouches/cosmetic-pouch-mud-floral.webp", label: "Cosmetic Pouch — Mud Floral", cat: "Pouches" },
  { src: "assets/img/products/pouches/cosmetic-pouch-peach-ocean-green-grid.webp", label: "Cosmetic Pouch — Peach Ocean Green Grid", cat: "Pouches" },
  { src: "assets/img/products/pouches/cosmetic-pouch-peach-ocean-green-grid-2.webp", label: "Cosmetic Pouch — Peach Ocean Green Grid", cat: "Pouches" },
  { src: "assets/img/products/pouches/cosmetic-pouch-peach-orange-grid.webp", label: "Cosmetic Pouch — Peach Orange Grid", cat: "Pouches" },
  { src: "assets/img/products/pouches/cosmetic-pouch-pink-floral.webp", label: "Cosmetic Pouch — Pink Floral", cat: "Pouches" }
];

// Combined product list for the product wall + lightbox
const showcaseItems = [...madhubaniItems, ...handmadeItems];

// Filtered list currently shown on the catalogue page (the lightbox walks this)
const catalogueItems = [];

function altOf(it) {
  return it.label + ' — handmade by women artisans at Project Hunar';
}
