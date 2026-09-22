import mongoose from "mongoose";
import Product from "./models/Product.js"; // adjust path if your Product model is in another folder


import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from Backend folder or root
dotenv.config({ path: path.resolve(__dirname, ".env") });
dotenv.config();

// 1. Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ Error: MONGO_URI is not defined in .env file!");
  process.exit(1);
}

mongoose.connect(MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// 2. Define products array with updated image paths and prices

const products = [
  // 1. Millet
  { name: "Kambu (Bajra) Flour 500g", category: "Millet", price: 40, image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760268062/bajra-flour_ngkfkc.png", description: "Nutritious pearl millet flour.\nRich in iron and fiber." },
  { name: "Ragi Flour 500g", category: "Millet", price: 35, image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760272312/ragi-flour_mi8rqx.png", description: "Nutritious finger millet flour.\nGreat for healthy recipes." },
  { name: "Millet Puttu Podi 250g", category: "Millet", price: 55, image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760266660/WhatsApp_Image_2025-10-11_at_18.54.23_9b813d28_vdt6gm.jpg", description: "Specialty millet puttu mix.\nAuthentic taste." },
  { name: "Millet Idly Dosa Mix 500g", category: "Millet", price: 65, image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760272312/millet-noodles_d2kyyw.png", description: "Healthy multi-millet dosa mix.\nEasy to prepare." },

  // 2. Instant Products
  { name: "Instant Parotta 200g", category: "Instant Products", price: 30, image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760272318/instant-parotta_lhleky.png", description: "Ready-to-cook parotta.\nSoft and fluffy every time." },
  { name: "Adai Dosa Mix 500g", category: "Instant Products", price: 85, image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760272316/rice-flour_cj7msm.png", description: "Quick adai dosa mix.\nEasy and protein-packed meals." },
  { name: "Rava Dosa Mix 500g", category: "Instant Products", price: 70, image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760276417/rava-org_yvgm7r.png", description: "Instant crispy rava dosa mix.\nRestaurant style." },

  // 3. Noodles (Req 2: Noodles – 100g, Noodles – 200g, Millet Noodles – 4 products)
  { name: "Noodles – 100g", category: "Noodles", price: 14, image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760272313/noodles_ryybot.png", description: "Classic Ramar instant noodles.\nQuick and tasty snack." },
  { name: "Noodles – 200g", category: "Noodles", price: 28, image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760272313/noodles_ryybot.png", description: "Family pack Ramar noodles.\nQuick and tasty meal." },
  { name: "Ragi Millet Noodles 200g", category: "Noodles", price: 55, image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760272312/millet-noodles_d2kyyw.png", description: "Healthy finger millet noodles.\nNutritious comfort food." },
  { name: "Kambu Millet Noodles 200g", category: "Noodles", price: 55, image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760272312/millet-noodles_d2kyyw.png", description: "Healthy pearl millet noodles.\nWholesome goodness." },
  { name: "Varagu Millet Noodles 200g", category: "Noodles", price: 58, image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760272312/millet-noodles_d2kyyw.png", description: "Nutritious kodo millet noodles.\nLight and fiber-rich." },
  { name: "Thinai Millet Noodles 200g", category: "Noodles", price: 58, image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760272312/millet-noodles_d2kyyw.png", description: "Nutritious foxtail millet noodles.\nWholesome and delicious." },

  // 4. Semiya (Req 3: Ragi Semiya – 200g, Regular Semiya – 200g, Semia – 500g)
  { name: "Regular Semiya – 200g", category: "Semiya", price: 25, image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760272316/vermicelli_oekzvx.png", description: "Soft and healthy vermicelli.\nPerfect for quick breakfast meals." },
  { name: "Semia – 500g", category: "Semiya", price: 58, image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760272316/vermicelli_oekzvx.png", description: "Roasted long vermicelli.\nIdeal for savory upma and sweet payasam." },
  { name: "Ragi Semiya – 200g", category: "Semiya", price: 32, image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760272313/ragi-vermicelli_gvvkfj.png", description: "Rich in fiber and nutrients.\nIdeal for wholesome healthy eating." },

  // 5. Flour Items (Req 4)
  { name: "Chakki Atta 500g", category: "Flour Items", price: 32, image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760266660/WhatsApp_Image_2025-10-11_at_18.54.22_f8b79ba1_jzvxuq.jpg", description: "Freshly ground 100% whole wheat atta.\nSoft and healthy rotis." },
  { name: "Chakki Atta 5kg", category: "Flour Items", price: 270, image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760266660/WhatsApp_Image_2025-10-11_at_18.54.22_f8b79ba1_jzvxuq.jpg", description: "Freshly ground whole wheat atta bulk pack." },
  { name: "Maida 500g", category: "Flour Items", price: 35, image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760272312/maida-flour_tuyebe.png", description: "Fine maida flour.\nIdeal for baking and cooking." },
  { name: "Rice Flour 250g", category: "Flour Items", price: 16, image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760272316/rice-flour_cj7msm.png", description: "Pure rice flour.\nGreat for idiappam, dosa and sweets." },
  { name: "Rice Flour 500g", category: "Flour Items", price: 30, image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760272316/rice-flour_cj7msm.png", description: "Pure rice flour.\nGreat for idiappam, dosa and sweets." },
  { name: "Murukku Flour 500g", category: "Flour Items", price: 60, image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760272316/murukku-flour_ltab6z.png", description: "Special murukku flour.\nCrunchy and delicious." },
  { name: "Idiappa Flour 500g", category: "Flour Items", price: 50, image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760266660/WhatsApp_Image_2025-10-11_at_18.54.23_9b813d28_vdt6gm.jpg", description: "Authentic idiappa flour.\nPerfect for soft traditional dishes." },
  { name: "Gram Flour 250g", category: "Flour Items", price: 33, image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760272311/gram-flour_yyeeec.png", description: "High-quality gram flour.\nGreat for snacks and sweets." },
  { name: "Gram Flour 500g", category: "Flour Items", price: 60, image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760272311/gram-flour_yyeeec.png", description: "High-quality gram flour.\nGreat for snacks and sweets." },
  { name: "Bajji Flour 200g", category: "Flour Items", price: 30, image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760266659/WhatsApp_Image_2025-10-11_at_18.54.22_39290d95_uqyz0z.jpg", description: "Special bajji flour blend.\nPerfect for deep-fried evening snacks." },

  // 6. Rava Sooji
  { name: "Roasted Sooji 250g", category: "Rava Sooji", price: 20, image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760276417/rava-org_yvgm7r.png", description: "Premium roasted sooji.\nIdeal for idli, upma and kesari." },
  { name: "Roasted Sooji 500g", category: "Rava Sooji", price: 36, image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760276417/rava-org_yvgm7r.png", description: "Premium roasted sooji.\nIdeal for idli, upma and kesari." },
  { name: "Roasted Sooji 1kg", category: "Rava Sooji", price: 71, image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760276417/rava-org_yvgm7r.png", description: "Premium roasted sooji value pack." },
  { name: "Broken Samba Wheat 500g", category: "Rava Sooji", price: 65, image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760266660/WhatsApp_Image_2025-10-11_at_18.54.24_7c543103_oj7kiz.jpg", description: "Premium broken samba wheat.\nHealthy and nutritious." },

  // 7. Pickles (Req 5: Bottle First, Pack Second - Pack weight suppressed)
  { name: "Mango Pickle (Bottle) 300g", category: "Pickles", packagingType: "bottle", price: 75, image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760266659/WhatsApp_Image_2025-10-11_at_18.54.22_39290d95_uqyz0z.jpg", description: "Spicy and tangy cut mango pickle in glass bottle." },
  { name: "Mixed Veg Pickle (Bottle) 300g", category: "Pickles", packagingType: "bottle", price: 75, image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760266659/WhatsApp_Image_2025-10-11_at_18.54.22_39290d95_uqyz0z.jpg", description: "Traditional mixed vegetable pickle in glass bottle." },
  { name: "Lime Pickle (Bottle) 300g", category: "Pickles", packagingType: "bottle", price: 70, image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760266659/WhatsApp_Image_2025-10-11_at_18.54.22_39290d95_uqyz0z.jpg", description: "Authentic lemon pickle in glass jar." },
  { name: "Mango Pickle (Pack)", category: "Pickles", packagingType: "pack", price: 45, image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760266659/WhatsApp_Image_2025-10-11_at_18.54.22_39290d95_uqyz0z.jpg", description: "Authentic mango pickle in pouch pack." },
  { name: "Mixed Veg Pickle (Pack)", category: "Pickles", packagingType: "pack", price: 45, image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760266659/WhatsApp_Image_2025-10-11_at_18.54.22_39290d95_uqyz0z.jpg", description: "Mixed vegetable pickle in handy pouch pack." },

  // 8. Thokku (Req 6: Bottle First, Pack Second - Pack weight suppressed)
  { name: "Tomato Thokku (Bottle) 300g", category: "Thokku", packagingType: "bottle", price: 85, image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760266659/WhatsApp_Image_2025-10-11_at_18.54.22_39290d95_uqyz0z.jpg", description: "Tangy country tomato thokku in glass bottle." },
  { name: "Garlic Thokku (Bottle) 300g", category: "Thokku", packagingType: "bottle", price: 95, image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760266659/WhatsApp_Image_2025-10-11_at_18.54.22_39290d95_uqyz0z.jpg", description: "Aromatic spiced garlic thokku in glass jar." },
  { name: "Tomato Thokku (Pack)", category: "Thokku", packagingType: "pack", price: 50, image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760266659/WhatsApp_Image_2025-10-11_at_18.54.22_39290d95_uqyz0z.jpg", description: "Simmered tomato thokku in fresh stay-pack." },
  { name: "Garlic Thokku (Pack)", category: "Thokku", packagingType: "pack", price: 55, image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760266659/WhatsApp_Image_2025-10-11_at_18.54.22_39290d95_uqyz0z.jpg", description: "Spiced garlic thokku in convenient pouch pack." },

  // 9. Traditional Mix (Req 7)
  { name: "Puliyotharai Mix 100g", category: "Traditional Mix", price: 45, image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760266660/WhatsApp_Image_2025-10-11_at_18.54.23_9b813d28_vdt6gm.jpg", description: "Traditional authentic temple-style puliyotharai mix." },
  { name: "Traditional Idli Podi 100g", category: "Traditional Mix", price: 40, image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760266660/WhatsApp_Image_2025-10-11_at_18.54.23_9b813d28_vdt6gm.jpg", description: "Flavorful spicy gun powder for idlis and dosas." },
  { name: "Ellu Idli Podi 100g", category: "Traditional Mix", price: 45, image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760266660/WhatsApp_Image_2025-10-11_at_18.54.23_9b813d28_vdt6gm.jpg", description: "Traditional sesame seed gunpowder." },
  { name: "Ulundhankali Mix 250g", category: "Traditional Mix", price: 65, image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760266660/WhatsApp_Image_2025-10-11_at_18.54.23_9b813d28_vdt6gm.jpg", description: "Nutritious roasted black gram mix for kali." },

  // 10. Appalam (Req 8)
  { name: "Traditional Appalam 100g", category: "Appalam", price: 35, image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760266659/WhatsApp_Image_2025-10-11_at_18.54.22_39290d95_uqyz0z.jpg", description: "Crunchy sun-dried urad dal appalam papad." },
  { name: "Pepper Appalam 100g", category: "Appalam", price: 40, image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760266659/WhatsApp_Image_2025-10-11_at_18.54.22_39290d95_uqyz0z.jpg", description: "Black pepper crushed crispy appalam." },
  { name: "Jeera Appalam 100g", category: "Appalam", price: 40, image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760266659/WhatsApp_Image_2025-10-11_at_18.54.22_39290d95_uqyz0z.jpg", description: "Aromatic cumin-infused crunchy papad." },
  { name: "Rice Vadam / Appalam 100g", category: "Appalam", price: 45, image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760266659/WhatsApp_Image_2025-10-11_at_18.54.22_39290d95_uqyz0z.jpg", description: "Crispy sun-dried South Indian rice vadam." },
];


// 3. Insert products into DB
const seedProducts = async () => {
  try {
    await Product.deleteMany(); // optional: clear existing products
    const inserted = await Product.insertMany(products);
    console.log(`Inserted ${inserted.length} products`);
    mongoose.connection.close();
  } catch (error) {
    console.error("Error seeding products:", error);
    mongoose.connection.close();
  }
};

seedProducts();