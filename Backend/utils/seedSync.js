import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Product from "../models/Product.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendDir = path.resolve(__dirname, "..");

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
};

const categoryOrder = [
  "Millet",
  "Instant Products",
  "Noodles",
  "Semiya",
  "Flour Items",
  "Maida",
  "Rava Sooji",
  "Pickles",
  "Thokku",
  "Traditional Mix",
  "Spice Powders",
  "Appalam",
];

export const syncSeedFilesFromDb = async () => {
  try {
    const rawProducts = await Product.find({}).lean();
    if (!rawProducts || rawProducts.length === 0) {
      console.warn("[SEED-SYNC] No products found in DB. Skipping sync.");
      return false;
    }

    const cleanProducts = rawProducts.map((p) => ({
      name: p.name,
      category: p.category || "Flour Items",
      categories:
        Array.isArray(p.categories) && p.categories.length > 0
          ? p.categories
          : p.category
          ? [p.category]
          : [],
      price: Number(p.price) || 0,
      mrp:
        p.mrp !== undefined && p.mrp !== ""
          ? Number(p.mrp)
          : Number(p.price) || 0,
      description: p.description || "",
      image: p.image || "",
      slug: p.slug || slugify(p.name),
      stock: p.stock !== undefined ? Number(p.stock) : 20,
      lowStockThreshold:
        p.lowStockThreshold !== undefined ? Number(p.lowStockThreshold) : 10,
      inStock: p.inStock !== undefined ? Boolean(p.inStock) : true,
      label: p.label || "",
      quote: p.quote || "",
      tamilName: p.tamilName || "",
      tamilSlogan: p.tamilSlogan || "",
    }));

    // Find all distinct categories, preserving categoryOrder first
    const dbCategories = [...new Set(cleanProducts.map((p) => p.category))];
    const orderedCategories = [
      ...categoryOrder.filter((cat) => dbCategories.includes(cat)),
      ...dbCategories.filter((cat) => !categoryOrder.includes(cat)),
    ];

    // 1. Write Backend/data/products.json
    const dataDir = path.join(backendDir, "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(
      path.join(dataDir, "products.json"),
      JSON.stringify(cleanProducts, null, 2),
      "utf8"
    );

    // 2. Generate and write Backend/SeedProducts.js
    let code = `import mongoose from "mongoose";
import Product from "./models/Product.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { syncSeedFilesFromDb } from "./utils/seedSync.js";

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

// 2. Define products array (${cleanProducts.length} default products)
export const products = [
`;

    orderedCategories.forEach((cat, catIdx) => {
      const items = cleanProducts.filter((p) => p.category === cat);
      code += `  // ${catIdx + 1}. ${cat} (${items.length} products)\n`;
      items.forEach((p) => {
        code += `  ${JSON.stringify(p)},\n`;
      });
      code += `\n`;
    });

    code += `];

// 3. Insert products into DB
export const seedProducts = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected successfully");

    await Product.deleteMany(); // Clear existing products
    console.log("Existing products cleared");

    const inserted = await Product.insertMany(products);
    console.log(\`✅ Successfully inserted \${inserted.length} default products!\`);

    await mongoose.connection.close();
    console.log("MongoDB connection closed");
  } catch (error) {
    console.error("❌ Error seeding products:", error);
    try {
      await mongoose.connection.close();
    } catch (closeErr) {
      // ignore
    }
    process.exit(1);
  }
};

// 4. CLI Execution:
// 'node SeedProducts.js' => seeds products to DB
// 'node SeedProducts.js --sync' => pulls products from DB and updates SeedProducts.js & data/products.json
if (process.argv[1] && process.argv[1].endsWith("SeedProducts.js")) {
  if (process.argv.includes("--sync") || process.argv.includes("-s")) {
    mongoose.connect(MONGO_URI).then(async () => {
      await syncSeedFilesFromDb();
      await mongoose.connection.close();
      console.log("Sync complete!");
    });
  } else {
    seedProducts();
  }
}
`;

    fs.writeFileSync(path.join(backendDir, "SeedProducts.js"), code, "utf8");
    console.log(
      `[SEED-SYNC] Successfully synced ${cleanProducts.length} products to SeedProducts.js and data/products.json`
    );
    return true;
  } catch (err) {
    console.error(
      "[SEED-SYNC] Error syncing products to seed files:",
      err.message
    );
    return false;
  }
};
