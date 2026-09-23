import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

// Case-insensitive unique index on category name
categorySchema.index({ name: 1 }, { unique: true });

const Category = mongoose.model("Category", categorySchema);
export default Category;
