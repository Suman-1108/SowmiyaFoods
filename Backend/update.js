// updateProducts.mjs
import mongoose from "mongoose";
import Product from "./models/Product.js"; // use .js extension in ES modules

const MONGO_URI ="mongodb+srv://user:user@cluster0.umyfat0.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0"; // replace with your DB URI

try {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to DB");

  const result = await Product.updateMany(
    {},
    { $set: { image: "" } }
  );

  console.log(`Updated ${result.modifiedCount} products`);
  await mongoose.disconnect();
} catch (err) {
  console.error(err);
}
