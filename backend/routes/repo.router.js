const express = require("express");
const repoController = require("../controllers/repoController"); // We will create this next
const authMiddleware = require("../middleware/authMiddleware");

const repoRouter = express.Router();

// Protected route to create a repository record in the database
repoRouter.post("/repo", authMiddleware, repoController.createRepository);

// Public route to get details about a repository
repoRouter.get("/repo/:s3RepoId", repoController.getRepositoryDetails);

module.exports = repoRouter;
