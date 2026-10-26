import mongoose from "mongoose";
const productSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    collection: { type: String, required: true },
    material: { type: String, required: true },
    price: { type: Number, min: 0, required: true },
    images: [String],
    description: String,
    variants: [String],
    stock: { type: Number, min: 0, default: 0 },
    purchasable: { type: Boolean, default: true },
  },
  { timestamps: true },
);
export default mongoose.model("Product", productSchema);
