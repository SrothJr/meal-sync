import mongoose from "mongoose";
import dotenv from "dotenv";
import { connectDB } from "./db/connectDB.js";
import Admin from "./models/admin.model.js";

// Load environment variables from .env file
dotenv.config();

const createAdmin = async () => {
  try {
    await connectDB();

    const adminEmail = "admin@gmail.com";

    // Check if an admin with this email already exists
    const existingAdmin = await Admin.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log("Admin user already exists.");
      mongoose.disconnect();
      return;
    }

    // Create the new admin
    // As requested, the password is NOT encrypted.
    const newAdmin = new Admin({
      name: "Admin",
      email: adminEmail,
      password: "admin",
    });

    await newAdmin.save();
    console.log("✅ Admin user created successfully!");
    console.log("Email:", adminEmail);
    console.log("Password: password123");
  } catch (error) {
    console.error("❌ Error creating admin user:", error);
  } finally {
    // Ensure the database connection is closed
    await mongoose.disconnect();
  }
};

createAdmin();
