const fs = require("fs").promises;
const path = require("path");
const { pullRepo } = require("./pull");

async function cloneRepo(repoId) {
  if (!repoId) {
    console.error("❌ Error: A repository ID is required to clone.");
    return;
  }

  try {
    const localRepoPath = path.resolve(process.cwd(), repoId);
    
    try {
      await fs.access(localRepoPath);
      console.error(`❌ Error: Destination path '${repoId}' already exists.`);
      return;
    } catch (e) {}

    //  Create the main project folder
    await fs.mkdir(localRepoPath, { recursive: true });
    console.log(`✅ Cloning into '${repoId}'...`);

    //  Create the .apnaGit directory inside it
    const apnaGitPath = path.join(localRepoPath, ".apnaGit");
    await fs.mkdir(apnaGitPath, { recursive: true });
    console.log("   -> Created .apnaGit directory.");

    // Create the commits directory
    await fs.mkdir(path.join(apnaGitPath, "commits"), { recursive: true });
    console.log("   -> Created commits directory.");

    //  Create the config file with the correct, existing repoId
    const config = {
      bucket: process.env.S3_BUCKET,
      repoId: repoId,
    };
    await fs.writeFile(
      path.join(apnaGitPath, "config.json"), 
      JSON.stringify(config, null, 2)
    );
    console.log("   -> Created config.json with the correct repository ID.");

    //  Change into the new directory to run pull
    const originalDirectory = process.cwd();
    process.chdir(localRepoPath);

    console.log("   -> Fetching repository files from the cloud...");
    await pullRepo();

    // Go back to the original directory
    process.chdir(originalDirectory);

    console.log(`\n✅ Successfully cloned repository ${repoId}.`);
    console.log(`You can now 'cd ${repoId}' to start working.`);

  } catch (err) {
    console.error("❌ Error cloning repository:", err);
  }
}

module.exports = { cloneRepo };
