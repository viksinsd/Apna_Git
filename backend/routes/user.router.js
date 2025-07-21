const express = require("express");
const userController = require("../controllers/userController.js"); // We will create this next
const authMiddleware = require("../middleware/authMiddleware");

const userRouter = express.Router();

// Public routes
userRouter.post("/signup", userController.signup);
userRouter.post("/login", userController.login);

// Protected routes
userRouter.get("/profile", authMiddleware, userController.getUserProfile);

module.exports = userRouter;
