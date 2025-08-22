import mongoose from 'mongoose';

const deliverySchema = new mongoose.Schema({
  // Link to the specific subscription this delivery is part of
  subscription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription',
    required: true,
  },
  // Link to the chef who prepared the meal
  chef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Assuming 'User' model includes chefs
    required: true,
  },
  // Link to the subscriber who receives the meal
  subscriber: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Assuming 'User' model includes subscribers
    required: true,
  },
  // The date for which this meal was scheduled for delivery (e.g., 2023-10-27)
  deliveryDate: {
    type: Date,
    required: true,
  },
  // The day of the week for the meal (e.g., "Monday", "Tuesday")
  dayOfWeek: {
    type: String,
    required: true,
    enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
  },
  // The type of meal (e.g., "Breakfast", "Lunch", "Dinner")
  mealType: {
    type: String,
    required: true,
    enum: ["Breakfast", "Lunch", "Dinner"],
  },
  // The name of the specific meal item (e.g., "Chicken Biryani")
  itemName: {
    type: String,
    required: true,
  },
  // Quantity of this specific meal item delivered (useful if a subscriber orders multiple of the same item)
  quantity: {
    type: Number,
    required: true,
    default: 1,
  },
  // Status of the delivery
  status: {
    type: String,
    enum: ['pending', 'prepared', 'out_for_delivery', 'delivered', 'cancelled', 'failed'],
    default: 'pending',
  },
  // Optional: Reference to the delivery person (User model with 'delivery_person' role)
  deliveryPerson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // Not required initially, but can be assigned later
  },
  // Optional: Timestamp when the delivery was marked as delivered
  deliveredAt: {
    type: Date,
  },
  // Optional: Any notes from the chef or delivery person
  notes: {
    type: String,
  },
}, { timestamps: true }); // Adds createdAt and updatedAt timestamps

const Delivery = mongoose.model('Delivery', deliverySchema);
export default Delivery;
