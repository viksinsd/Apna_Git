const fs = require("fs").promises;
const path = require("path");
const { s3, S3_BUCKET } = require(path.join(process.argv[1], '..', 'aws-config.js'));
const io = require("socket.io-client");
const { readGlobalConfig } = require('./authController');

const SERVER_URL = "https://apna-git-2sie.onrender.com";

async function pushRepo() {
  //  Check if the user is logged in.
  const globalConfig = await readGlobalConfig();
  const token = globalConfig.token;
  if (!token) {
    console.error("❌ Error: You are not logged in. Please run 'apna-git login' first.");
    return;
  }

  const repoPath = path.resolve(process.cwd(), ".apnaGit");
  const commitsPath = path.join(repoPath, "commits");
  const configPath = path.join(repoPath, "config.json");
  
  const socket = io(SERVER_URL);

  try {
    const configData = await fs.readFile(configPath);
    const { repoId } = JSON.parse(configData);

    if (!repoId) {
      console.error("❌ Error: Repository ID not found in config.json.");
      socket.disconnect();
      return;
    }
    const commitDirs = await fs.readdir(commitsPath);
    for (const commitDir of commitDirs) {
      const commitPath = path.join(commitsPath, commitDir);
      const files = await fs.readdir(commitPath);

      for (const file of files) {
        const filePath = path.join(commitPath, file);
        const fileContent = await fs.readFile(filePath);
        const params = {
          Bucket: S3_BUCKET,
          Key: `${repoId}/commits/${commitDir}/${file}`,
          Body: fileContent,
        };
        await s3.upload(params).promise();
      }
    }

    console.log(`✅ All commits for repo ${repoId} pushed to S3.`);

    // Use the logged-in user's name for the notification.
    const eventData = { repoId, commitCount: commitDirs.length, user: globalConfig.username || 'A Developer' };
    socket.emit("cli-event", { type: "NEW_PUSH", payload: eventData });
    console.log("   -> Push event sent to the server.");

  } catch (err) {
    console.error("❌ Error pushing to S3 : ", err);
  } finally {
    setTimeout(() => socket.disconnect(), 500);
  }
}

module.exports = { pushRepo };
