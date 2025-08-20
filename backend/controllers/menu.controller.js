import Menu from "../models/menu.model.js";
import { User } from "../models/user.model.js";

export const createMenu = async (req, res) => {
  try {
    const { title, description, schedule } = req.body;
    const chefId = req.userId;

    const user = await User.findById(chefId).select("-password");
    if (!user) {
      return res
        .status(403)
        .json({ success: false, message: "User does not exists" });
    } else if (user.role !== "chef") {
      return res
        .status(403)
        .json({ success: false, message: "Only chefs can create menus" });
    }

    const menu = new Menu({
      chef: chefId,
      title,
      description,
      schedule,
    });
    await menu.save();

    res
      .status(201)
      .json({ success: true, message: "Menu Created successfully" });
  } catch (error) {
    console.error("Error in createMenu", error);
    res
      .status(500)
      .json({ success: false, message: "Server Error, in createMenu" });
  }
};

export const updateMenu = async (req, res) => {
  try {
    const { menuId } = req.params;
    const { title, description, schedule } = req.body;
    const chefId = req.userId;

    const menu = await Menu.findById(menuId);

    if (!menu) {
      return res
        .status(404)
        .json({ success: false, message: "Menu not found" });
    }
    if (menu.chef.toString() !== chefId) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Access denied. You can only update your own menus",
        });
    }

    menu.title = title || menu.title;
    menu.description = description || menu.description;
    if (schedule) {
      menu.schedule = schedule;
    }

    const updatedMenu = await menu.save();

    res.status(200).json({
      success: true,
      message: "Menu updated Successfully",
      menu: updatedMenu,
    });
  } catch (error) {
    console.error("Error in updateMenu ", error);
    res
      .status(500)
      .json({ success: false, message: "Server error in updateMenu" });
  }
};
