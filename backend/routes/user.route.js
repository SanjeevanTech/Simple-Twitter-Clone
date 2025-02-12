import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import { getProfile,followunfollowUser,getSuggestUsers,updateUser } from "../controller/user.controller.js";

const router=express.Router();
router.get("/profile/:username",protectRoute,getProfile)
router.post("/follow/:id",protectRoute,followunfollowUser)
router.post("/suggested",protectRoute,getSuggestUsers)
router.post("/update",protectRoute,updateUser)

export default router;
