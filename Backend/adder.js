// adminSeed.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js"; // Adjust path to your User model

dotenv.config();

// Replace with your MongoDB URI
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/yourDatabaseName";

const adminUser = {
  name: "Admin",
  email: "sowmiyafoods01@gmail.com",
  password: "$2b$10$3dN13l9NFfpqcvPy8JaW4.FAq3Wg6laiOtcXUZ8KRTl.DakfOgpma", // hashed password
  isAdmin: true,
};

const seedAdmin = async () => {
  try {
    await mongoose.connect(MONGO_URI, { 
      useNewUrlParser: true, 
      useUnifiedTopology: true 
    });
    console.log("MongoDB connected");

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminUser.email });
    if (existingAdmin) {
      console.log("Admin already exists:", existingAdmin);
    } else {
      const newAdmin = new User(adminUser);
      await newAdmin.save();
      console.log("Admin user added successfully:", newAdmin);
    }

    mongoose.disconnect();
  } catch (err) {
    console.error("Error seeding admin:", err);
    mongoose.disconnect();
  }
};

seedAdmin();
