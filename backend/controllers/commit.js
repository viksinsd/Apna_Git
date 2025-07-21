const fs = require("fs").promises;
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const io = require("socket.io-client");
const { readGlobalConfig } = require('./authController');

const SERVER_URL = "https://apna-git.onrender.com";

async function commitRepo(message) {
  //  Check if the user is logged in.
  const globalConfig = await readGlobalConfig();
  const token = globalConfig.token;
  if (!token) {
    console.error("❌ Error: You are not logged in. Please run 'apna-git login' first.");
    return;
  }

  const repoPath = path.resolve(process.cwd(), ".apnaGit");
  const stagedPath = path.join(repoPath, "staging");
  const commitPath = path.join(repoPath, "commits");
  const configPath = path.join(repoPath, "config.json");

  const socket = io(SERVER_URL);

  try {
    const stagedFiles = await fs.readdir(stagedPath).catch(() => []);
    if (stagedFiles.length === 0) {
      console.log("Nothing to commit, the staging area is empty.");
      socket.disconnect();
      return;
    }

    const commitID = uuidv4();
    const commitDir = path.join(commitPath, commitID);
    await fs.mkdir(commitDir, { recursive: true });

    for (const file of stagedFiles) {
      await fs.copyFile(
        path.join(stagedPath, file),
        path.join(commitDir, file)
      );
    }
    
    const commitMeta = { id: commitID, message, date: new Date().toISOString() };
    await fs.writeFile(
      path.join(commitDir, "commit.json"),
      JSON.stringify(commitMeta)
    );

    await fs.rm(stagedPath, { recursive: true, force: true });
    console.log(`✅ Commit ${commitID} created and staging area cleared.`);

    const configData = await fs.readFile(configPath, "utf-8");
    const { repoId } = JSON.parse(configData);
    
    // Use the logged-in user's name for the notification.
    const eventData = { repoId, commit: commitMeta, user: globalConfig.username || 'A Developer' };
    socket.emit("cli-event", { type: "NEW_COMMIT", payload: eventData });
    console.log("   -> Commit event sent to the server.");

  } catch (err) {
    console.error("❌ Error committing files: ", err);
  } finally {
    setTimeout(() => socket.disconnect(), 500);
  }
}

module.exports = { commitRepo };
