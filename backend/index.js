#!/usr/bin/env node
const express = require("express");
const dotenv = require("dotenv");


const yargs = require("yargs");
const { hideBin } = require("yargs/helpers");

const { initRepo } = require("./controllers/init");
const { addRepo } = require("./controllers/add");
const { commitRepo } = require("./controllers/commit");
const { pushRepo } = require("./controllers/push");
const { pullRepo } = require("./controllers/pull");
const { revertRepo } = require("./controllers/revert");
const { cloneRepo } = require("./controllers/clone");
const { signupUser, loginUser } = require("./controllers/authController"); // Import auth functions


function startServer() {
  const express = require("express");
  const cors = require("cors");
  const mongoose = require("mongoose");
  const bodyParser = require("body-parser");
  const http = require("http");
  const { Server } = require("socket.io");
  const mainRouter = require("./routes/main.router");

  const app = express();
  const port = process.env.PORT || 3002;

  app.use(bodyParser.json());
  app.use(express.json());
  app.use(cors({ origin: "*" }));
  app.use("/api", mainRouter); 

  const mongoURI = process.env.MONGODB_URI;
  if (!mongoURI) {
    console.error("FATAL ERROR: MONGODB_URI is not defined.");
    process.exit(1);
  }
  mongoose
    .connect(mongoURI)
    .then(() => console.log("MongoDB connected!"))
    .catch((err) => console.error("Unable to connect : ", err));

  const httpServer = http.createServer(app);
  const io = new Server(httpServer, {
    cors: { origin: "*", methods: ["GET", "POST"] },
  });

  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);
    socket.on("cli-event", (data) => {
      console.log(`Received event '${data.type}' from CLI.`);
      io.emit("repository-update", data);
      socket.broadcast.emit("repository-update", data);
    });
    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  httpServer.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}


dotenv.config();

yargs(hideBin(process.argv))
 .command("start", "Starts the web server", {}, startServer)
 .command("signup", "Create a new user account", {}, signupUser)
  .command("login", "Log in to your user account", {}, loginUser)
  .command(
    "init", // Simplified command definition
    "Initialise a new repository in the current directory",
    {}, // No builder function needed for options
    () => initRepo() // Call the function directly
  )
  .command(
    "add <file>",
    "Add a file to the repository",
    (yargs) => {
      yargs.positional("file", {
        describe: "File to add, or '.' to add all files",
        type: "string",
      });
    },
    (argv) => {
      addRepo(argv.file);
    }
  )
  .command(
    "commit <message>",
    "Commit the staged files",
    (yargs) => {
      yargs.positional("message", {
        describe: "Commit message",
        type: "string",
      });
    },
    (argv) => {
      commitRepo(argv.message);
    }
  )
  .command(
    "clone <repoId>", // Define the new clone command
    "Clone a repository from the cloud",
    (yargs) => {
      yargs.positional("repoId", {
        describe: "The ID of the repository to clone",
        type: "string",
      });
    },
    (argv) => cloneRepo(argv.repoId)
  )
  .command("push", "Push commits to S3", {}, pushRepo)
  .command("pull", "Pull commits from S3", {}, pullRepo)
  .command(
    "revert <commitID>",
    "Revert to a specific commit",
    (yargs) => {
      yargs.positional("commitID", {
        describe: "Comit ID to revert to",
        type: "string",
      });
    },
    (argv) => {
      revertRepo(argv.commitID);
    }
  )
  .demandCommand(1, "You need at least one command")
  .help().argv;

