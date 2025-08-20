import mongoose from "mongoose";

const menuItemSchema = new mongoose.Schema({
  day: {
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
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true, min: 0 },
});

const menuSchema = new mongoose.Schema(
  {
    chef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    schedule: [menuItemSchema],
  },
  { timestamps: true }
);

const Menu = mongoose.model("Menu", menuSchema);
export default Menu;
