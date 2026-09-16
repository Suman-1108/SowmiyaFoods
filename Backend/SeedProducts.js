import mongoose from "mongoose";
import Product from "./models/Product.js"; // adjust path if your Product model is in another folder


// 1. Connect to MongoDB
const MONGO_URI ="mongodb+srv://user:user@cluster0.umyfat0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected"))
.catch((err) => console.error("MongoDB connection error:", err));

// 2. Define products array with updated image paths and prices

const products = [
  { name: "Vermicelli 200g", category: "VERMICELLI", price: 25, image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760272316/vermicelli_oekzvx.png", description: "Soft and healthy vermicelli.\nPerfect for quick meals." },
  { name: "Vermicelli 500g", category: "VERMICELLI", price: 58, image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760272316/vermicelli_oekzvx.png", description: "Soft and healthy vermicelli.\nPerfect for quick meals." },
  { name: "Ragi Vermicelli 200g", category: "VERMICELLI", price: 30, image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760272313/ragi-vermicelli_gvvkfj.png", description: "Rich in fiber and nutrients.\nIdeal for healthy eating." },
  { name: "Instant Parrota 200g", category: "INSTANT PRODUCTS", price: 30, image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760272318/instant-parotta_lhleky.png", description: "Ready-to-cook parotta.\nSoft and fluffy every time." },
  { name: "Noodles with Masala 100g", category: "NOODLES", price: 14, image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760272313/noodles_ryybot.png", description: "Spicy instant noodles.\nQuick and tasty snack." },
  { name: "Noodles with Masala 200g", category: "NOODLES", price: 30, image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760272313/noodles_ryybot.png", description: "Spicy instant noodles.\nQuick and tasty snack." },
  { name: "Millet Noodles 200g", category: "NOODLES", price: 60, image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760272312/millet-noodles_d2kyyw.png", description: "Healthy millet noodles.\nLight and nutritious." },
  { name: "Roasted Sooji 250g", category: "RAVA", price: 20, image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760276417/rava-org_yvgm7r.png", description: "Premium roasted sooji.\nIdeal for idli and upma." },
  { name: "Roasted Sooji 500g", category: "RAVA", price: 36, image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760276417/rava-org_yvgm7r.png", description: "Premium roasted sooji.\nIdeal for idli and upma." },
  { name: "Roasted Sooji 1kg", category: "RAVA", price: 71, image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760276417/rava-org_yvgm7r.png", description: "Premium roasted sooji.\nIdeal for idli and upma." },
  { name: "Ragi Flour 500g", category: "FLOUR", price: 35, image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760272312/ragi-flour_mi8rqx.png", description: "Nutritious ragi flour.\nGreat for healthy recipes." },
  { name: "Bajra Flour 500g", category: "FLOUR", price: 40, image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760268062/bajra-flour_ngkfkc.png", description: "Nutritious bajra flour.\nPerfect for traditional recipes." },
  { name: "Maida 500g", category: "FLOUR", price: 35, image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760272312/maida-flour_tuyebe.png", description: "Fine maida flour.\nIdeal for baking and cooking." },
  { name: "Rice Flour 250g", category: "FLOUR", price: 16, image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760272316/rice-flour_cj7msm.png", description: "Pure rice flour.\nGreat for dosa and sweets." },
  { name: "Rice Flour 500g", category: "FLOUR", price: 30, image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760272316/rice-flour_cj7msm.png", description: "Pure rice flour.\nGreat for dosa and sweets." },
  { name: "Murukku Flour 500g", category: "FLOUR", price: 60, image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760272316/murukku-flour_ltab6z.png", description: "Special murukku flour.\nCrunchy and tasty." },
  { name: "Idiappa Flour 500g", category: "FLOUR", price: 50, image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760266660/WhatsApp_Image_2025-10-11_at_18.54.23_9b813d28_vdt6gm.jpg", description: "Authentic idiappa flour.\nPerfect for traditional dishes." },
  { name: "Gram Flour 250g", category: "FLOUR", price: 33, image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760272311/gram-flour_yyeeec.png", description: "High-quality gram flour.\nGreat for snacks and curries." },
  { name: "Gram Flour 500g", category: "FLOUR", price: 60, image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760272311/gram-flour_yyeeec.png", description: "High-quality gram flour.\nGreat for snacks and curries." },
  { name: "Bajji Flour 200g", category: "FLOUR", price: 30, image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760266659/WhatsApp_Image_2025-10-11_at_18.54.22_39290d95_uqyz0z.jpg", description: "Special bajji flour.\nPerfect for deep-fried snacks." },
  { name: "Broken Samba Wheat 500g", category: "RAVA", price: 65, image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760266660/WhatsApp_Image_2025-10-11_at_18.54.24_7c543103_oj7kiz.jpg", description: "Premium broken wheat.\nHealthy and versatile." },
  { name: "Adai Dosa Mix 500g", category: "INSTANT PRODUCTS", price: 85, image: "no-image.jpg", description: "Quick adai dosa mix.\nEasy and tasty meals." },
  { name: "Chakki Atta 500g", category: "FLOUR", price: 32, image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760266660/WhatsApp_Image_2025-10-11_at_18.54.22_f8b79ba1_jzvxuq.jpg", description: "Freshly ground atta.\nSoft and healthy rotis." },
  { name: "Chakki Atta 5kg", category: "FLOUR", price: 270, image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760266660/WhatsApp_Image_2025-10-11_at_18.54.22_f8b79ba1_jzvxuq.jpg", description: "Freshly ground atta.\nSoft and healthy rotis." }
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