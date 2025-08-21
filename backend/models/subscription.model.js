import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    subscriber: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    chef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    menu: { type: mongoose.Schema.Types.ObjectId, ref: "Menu", required: true },

    selection: {
      type: [
        {
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
          mealTypes: {
            type: [String],
            required: true,
            enum: ["Breakfast", "Lunch", "Dinner"],
          },
        },
      ],
      required: true,
    },
    subscriptionType: {
      type: String,
      required: true,
      enum: ["weekly", "monthly"],
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    totalPrice: { type: Number, required: true },
    status: {
      type: String,
      required: true,
      default: "pending",
      enum: ["pending", "active", "paused", "expired", "cancelled", "rejected"],
    },
    autoRenew: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

subscriptionSchema.path("selection").validate(function (selection) {
  if (this.isNew || this.isModified("selection")) {
    const days = selection.map((s) => s.day);
    const uniqueDays = new Set(days);

    return uniqueDays.size === days.length;
  }
  return true;
}, "Each day can only be selected once");
const Subscription = mongoose.model("Subscription", subscriptionSchema);
export default Subscription;
