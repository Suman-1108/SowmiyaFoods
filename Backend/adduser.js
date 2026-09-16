// migrateUsernames.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js"; // path to your User model

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
};

const addUsernameToExistingUsers = async () => {
  try {
    const users = await User.find({ username: { $exists: false } });

    for (const user of users) {
      const username = user.email.split("@")[0] + user._id.toString().slice(-4);
      user.username = username;
      await user.save();
    }

    console.log("Usernames added successfully");
    process.exit(0);
  } catch (err) {
    console.error("Error updating usernames:", err);
    process.exit(1);
  }
};

const run = async () => {
  await connectDB();
  await addUsernameToExistingUsers();
};

run();
