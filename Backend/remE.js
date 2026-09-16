// removeEmailField.js
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connected...");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

const removeEmailField = async () => {
  try {
    await connectDB();

    const usersCollection = mongoose.connection.collection("users");

    // Step 1: Drop the unique index on "email" if it exists
    try {
      await usersCollection.dropIndex("email_1");
      console.log("✅ Dropped unique index on 'email'");
    } catch (err) {
      if (err.codeName === "IndexNotFound") {
        console.log("ℹ️ No 'email' index found, continuing...");
      } else {
        throw err;
      }
    }

    // Step 2: Remove the 'email' field from all user documents
    const result = await usersCollection.updateMany({}, { $unset: { email: "" } });
    console.log(`✅ Removed 'email' field from ${result.modifiedCount} users`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error removing email field:", error);
    process.exit(1);
  }
};

removeEmailField();
