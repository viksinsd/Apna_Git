const fs = require("fs").promises;
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const axios = require('axios');
const { readGlobalConfig } = require('./authController');

// CORRECTED: Added /api to the end of the URL to match your server routes
const API_URL = 'https://apna-git.onrender.com/api';

async function initRepo() {
  const name = path.basename(process.cwd());
  console.log(`Initializing repository in '${name}'...`);

  const globalConfig = await readGlobalConfig();
  const token = globalConfig.token;
  if (!token) {
    console.error("❌ Error: You are not logged in. Please run 'apna-git login' first.");
    return;
  }

  const repoPath = path.resolve(process.cwd(), ".apnaGit");
  const s3RepoId = uuidv4();

  try {
    try {
      await fs.access(repoPath);
      console.error("❌ Error: This directory is already an ApnaGit repository.");
      return;
    } catch (e) {}

    await fs.mkdir(repoPath, { recursive: true });
    await fs.mkdir(path.join(repoPath, "commits"), { recursive: true });
    
    const localConfig = {
      bucket: process.env.S3_BUCKET,
      repoId: s3RepoId,
    };
    await fs.writeFile(
      path.join(repoPath, "config.json"),
      JSON.stringify(localConfig, null, 2)
    );
    console.log(`✅ Local repository initialised with ID: ${s3RepoId}`);

    console.log("Registering repository with the server...");
    await axios.post(
      `${API_URL}/repo`,
      {
        s3RepoId: s3RepoId,
        name: name,
        description: '',
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    
    console.log(`✅ Repository '${name}' successfully registered on the server!`);

  } catch (err) {
    console.error("❌ Error during initialization:", err.response?.data?.message || err.message);
  }
}

module.exports = { initRepo };
