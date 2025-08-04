import { User } from "../models/user.model.js";

export const findChefsInArea = async (req, res) => {
  try {
    const currentUserId = req.userId;
    const currentUser = await User.findById(currentUserId);

    if (!currentUser) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    const chefs = await User.find({
      area: currentUser.area,
      role: "chef",
      _id: { $ne: currentUserId },
    }).select("email name area");

    res.status(200).json({ success: true, chefs });
  } catch (error) {
    console.error("Error in findChefsInArea: ", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
