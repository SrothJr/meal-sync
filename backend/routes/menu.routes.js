import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import {
  createMenu,
  deleteMenu,
  getMenuById,
  getMenusByChefId,
  updateMenu,
  getMenusByArea,
} from "../controllers/menu.controller.js";

const router = express.Router();

router.post("/", verifyToken, createMenu);

router.get("/chef/:chefId", getMenusByChefId);

router.get("/area/:area", getMenusByArea);

router.get("/:menuId", getMenuById);

router.put("/:menuId", verifyToken, updateMenu);

router.delete("/:menuId", verifyToken, deleteMenu);

export default router;
