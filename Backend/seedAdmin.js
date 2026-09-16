import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "./models/User.js";
import Admin from "./models/Admin.js";

dotenv.config();

const MAX_ADMINS = 4;

const DEFAULT_ADMINS = [
  {
    name: "SowmiyaFoods01",
    email: process.env.ADMIN_EMAIL || "sowmiyafoods01@gmail.com",
    password: process.env.ADMIN_PASSWORD || "admin123@",
  },
];

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const seedAdmins = async () => {
  try {
    console.log(`\n--- Sowmiya Foods: Admin Collection Seeder ---`);
    const existingAdminsInCollection = await Admin.find({});
    const existingUserAdmins = await User.find({
      $or: [{ isAdmin: true }, { role: "admin" }, { isPrimaryAdmin: true }],
    });

    console.log(`Found ${existingAdminsInCollection.length} admin(s) in 'admins' collection and ${existingUserAdmins.length} in 'users' collection.`);

    let createdCount = 0;
    for (const candidate of DEFAULT_ADMINS) {
      const emailClean = candidate.email.toLowerCase();
      const hashedPassword = await bcrypt.hash(candidate.password, 10);

      // Check if admin exists in Admin collection
      const adminExists = await Admin.findOne({
        $or: [{ email: emailClean }, { name: candidate.name }],
      });

      if (!adminExists) {
        const currentCount = await Admin.countDocuments({});
        const isFirst = currentCount === 0;

        const newAdmin = new Admin({
          name: candidate.name,
          email: emailClean,
          password: hashedPassword,
          isAdmin: true,
          isPrimaryAdmin: isFirst,
          role: "admin",
          permissions: ["*"],
          isActive: true,
        });
        await newAdmin.save();
        createdCount++;
        console.log(`  ✅ Seeded into 'admins' collection: Name: "${candidate.name}", Email: "${emailClean}"`);
      }

      // Sync into User collection as well for seamless login across both collections
      const userExists = await User.findOne({
        $or: [{ email: emailClean }, { name: candidate.name }],
      });

      if (!userExists) {
        const userAdminCount = await User.countDocuments({
          $or: [{ isAdmin: true }, { role: "admin" }, { isPrimaryAdmin: true }],
        });
        const isFirstUser = userAdminCount === 0;

        const newUserAdmin = new User({
          name: candidate.name,
          email: emailClean,
          password: hashedPassword,
          isAdmin: true,
          isPrimaryAdmin: isFirstUser,
          role: "admin",
          permissions: ["*"],
          isActive: true,
        });
        await newUserAdmin.save();
        console.log(`  ✅ Synced into 'users' collection: Name: "${candidate.name}", Email: "${emailClean}"`);
      }
    }

    const finalAdminsCollection = await Admin.find({});
    console.log(`\nSeeding complete! Total active accounts in 'admins' collection: ${finalAdminsCollection.length}.`);
    process.exit(0);
  } catch (error) {
    console.error("Error seeding admins:", error);
    process.exit(1);
  }
};

const run = async () => {
  await connectDB();
  await seedAdmins();
};

run();