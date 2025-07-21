const fs = require("fs").promises;
const path = require("path");
const { readGlobalConfig } = require('./authController'); // Import the helper

async function getAllFiles(dirPath, arrayOfFiles) {
  const files = await fs.readdir(dirPath);
  arrayOfFiles = arrayOfFiles || [];
  for (const file of files) {
    if (file === ".apnaGit" || file === "node_modules") continue;
    const fullPath = path.join(dirPath, file);
    const stat = await fs.stat(fullPath);
    if (stat.isDirectory()) {
      await getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  }
  return arrayOfFiles;
}

async function addRepo(targetPath) {
  // --- NEW: Login Check ---
  const globalConfig = await readGlobalConfig();
  const token = globalConfig.token;
  if (!token) {
    console.error("❌ Error: You are not logged in. Please run 'apna-git login' first.");
    return;
  }
  // --- End of Login Check ---

  const repoPath = path.resolve(process.cwd(), ".apnaGit");
  const stagingPath = path.join(repoPath, "staging");

  try {
    await fs.mkdir(stagingPath, { recursive: true });

    if (targetPath === ".") {
      const stagedFiles = await fs.readdir(stagingPath);
      for (const file of stagedFiles) {
        await fs.unlink(path.join(stagingPath, file));
      }
      console.log("Staging area cleared.");

      const allFiles = await getAllFiles(process.cwd());
      for (const filePath of allFiles) {
        const fileName = path.basename(filePath);
        await fs.copyFile(filePath, path.join(stagingPath, fileName));
      }
      console.log(`All files added to the staging area!`);
    } else {
      const fileName = path.basename(targetPath);
      await fs.copyFile(targetPath, path.join(stagingPath, fileName));
      console.log(`File ${fileName} added to the staging area!`);
    }
  } catch (err) {
    console.error("Error adding file(s): ", err);
  }
}

module.exports = { addRepo };
