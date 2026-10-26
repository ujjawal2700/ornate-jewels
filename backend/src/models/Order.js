import mongoose from "mongoose";
const orderSchema = new mongoose.Schema(
  {
    customer: { name: String, email: String },
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        name: String,
        variant: String,
        quantity: { type: Number, min: 1 },
        unitPrice: { type: Number, min: 0 },
      },
    ],
    shippingAddress: {
      line1: String,
      city: String,
      state: String,
      pincode: String,
    },
    subtotal: Number,
    shipping: Number,
    total: Number,
    status: {
      type: String,
      enum: ["placed", "processing", "shipped", "delivered"],
      default: "placed",
    },
  },
  { timestamps: true },
);
export default mongoose.model("Order", orderSchema);
