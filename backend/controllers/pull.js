const fs = require("fs").promises;
const path = require("path");
// CORRECTED: Use a more reliable path to find the config file
const { s3, S3_BUCKET } = require("../config/aws-config");

async function pullRepo() {
  const repoPath = path.resolve(process.cwd(), ".apnaGit");
  const configPath = path.join(repoPath, "config.json");

  try {
    const configData = await fs.readFile(configPath);
    const { repoId } = JSON.parse(configData);

    if (!repoId) {
      console.error(
        "Error: Repository ID not found. Please run 'apna-git init' again."
      );
      return;
    }

    const data = await s3
      .listObjectsV2({
        Bucket: S3_BUCKET,
        Prefix: `${repoId}/commits/`,
      })
      .promise();

    if (!data.Contents || data.Contents.length === 0) {
      console.log("No commits to pull from S3 for this repository.");
      return;
    }

    const objects = data.Contents;

    for (const object of objects) {
      const key = object.Key;
      const relativeKey = path.relative(repoId, key);
      const localFilePath = path.join(repoPath, relativeKey);

      await fs.mkdir(path.dirname(localFilePath), { recursive: true });

      const params = {
        Bucket: S3_BUCKET,
        Key: key,
      };

      const fileContent = await s3.getObject(params).promise();
      await fs.writeFile(localFilePath, fileContent.Body);
    }
    console.log(`All commits for repo ${repoId} pulled from S3.`);
  } catch (err) {
    console.error("Unable to pull : ", err);
  }
}

module.exports = { pullRepo };
