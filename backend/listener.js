const io = require("socket.io-client");

// The public URL of your deployed server on Render
const SERVER_URL = "https://apna-git.onrender.com";

console.log(`Connecting to server at ${SERVER_URL}...`);

const socket = io(SERVER_URL);

socket.on("connect", () => {
  console.log(`✅ Successfully connected to the server! (Socket ID: ${socket.id})`);
  console.log("Listening for real-time repository updates...");
});

// This is the listener for the 'repository-update' event from your server
socket.on("repository-update", (data) => {
  console.log("\n--- 🔴 New Activity Received! ---");
  
  if (data.type === 'NEW_COMMIT') {
    const { user, commit, repoId } = data.payload;
    console.log(`[COMMIT] User '${user}' made a commit in repo '${repoId.substring(0,8)}...'`);
    console.log(`   -> Message: "${commit.message}"`);
  } 
  else if (data.type === 'NEW_PUSH') {
    const { user, repoId, commitCount } = data.payload;
    console.log(`[PUSH] User '${user}' pushed ${commitCount} commit(s) to repo '${repoId.substring(0,8)}...'`);
  }
  
  console.log("--------------------------------\n");
});

socket.on("disconnect", () => {
  console.log("❌ Disconnected from the server.");
});

socket.on("connect_error", (err) => {
  console.error("Connection failed:", err.message);
});
