const express = require("express");
const userRouter = require("./user.router");
const repoRouter = require("./repo.router");

const mainRouter = express.Router();

mainRouter.use(userRouter);
mainRouter.use(repoRouter);

mainRouter.get("/", (req, res) => {
  res.send("Welcome to the ApnaGit API Server!");
});

module.exports = mainRouter;
