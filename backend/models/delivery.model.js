import mongoose from "mongoose";

const deliverySchema = new mongoose.Schema(
  {
    subscription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
      required: true,
    },
    chef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subscriber: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    deliveryDate: {
      type: Date,
      required: true,
    },
    dayOfWeek: {
      type: String,
      required: true,
      enum: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
    },
    mealType: {
      type: String,
      required: true,
      enum: ["Breakfast", "Lunch", "Dinner"],
    },
    itemName: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "prepared",
        "out_for_delivery",
        "delivered",
        "cancelled",
        "failed",
      ],
      default: "pending",
    },
    deliveryPerson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    deliveredAt: {
      type: Date,
    },
    notes: {
      type: String,
    },
  },
  { timestamps: true }
);

const Delivery = mongoose.model("Delivery", deliverySchema);
export default Delivery;
