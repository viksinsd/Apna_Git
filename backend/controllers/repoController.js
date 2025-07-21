const Repository = require("../models/repoModel");
const User = require("../models/userModel");

async function createRepository(req, res) {
  const { s3RepoId, name, description } = req.body;
  const userId = req.user.id; // From authMiddleware

  try {
    let repo = await Repository.findOne({ s3RepoId });
    if (repo) {
      return res.status(400).json({ message: "Repository already exists in database." });
    }

    repo = new Repository({
      s3RepoId,
      name,
      description,
      owner: userId,
    });
    await repo.save();

    // Link this new repo to the user who created it
    await User.findByIdAndUpdate(userId, { $push: { repositories: repo._id } });

    res.status(201).json(repo);
  } catch (err) {
    console.error("Create Repo Error:", err.message);
    res.status(500).send("Server error");
  }
}

async function getRepositoryDetails(req, res) {
    try {
        const repo = await Repository.findOne({ s3RepoId: req.params.s3RepoId }).populate('owner', 'username email');
        if (!repo) {
            return res.status(404).json({ message: "Repository not found." });
        }
        res.json(repo);
    } catch (err) {
        console.error("Get Repo Error:", err.message);
        res.status(500).send("Server error");
    }
}

module.exports = { createRepository, getRepositoryDetails };
