import { User } from "../models/user.model.js";
import Subscription from "../models/subscription.model.js";

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password");
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.error("Error in getAllUsers:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const toggleUserBanStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    user.isBanned = !user.isBanned;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User has been successfully ${
        user.isBanned ? "banned" : "unbanned"
      }.`,
      data: user,
    });
  } catch (error) {
    console.error("Error in toggleUserBanStatus:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const getAllSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.find({})
      .populate("subscriber", "name email")
      .populate("chef", "name email")
      .populate("menu", "name price schedule");
    res.status(200).json({ success: true, data: subscriptions });
  } catch (error) {
    console.error("Error in getAllSubscriptions:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
