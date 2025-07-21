const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/userModel");

async function signup(req, res) {
  const { username, password, email } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({ username, email, password: hashedPassword });
    await user.save();

    const payload = { id: user.id, username: user.username };
    const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: "1h" });

    res.status(201).json({ token, userId: user.id });
  } catch (err) {
    console.error("Signup Error:", err.message);
    res.status(500).send("Server error");
  }
}

async function login(req, res) {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    const payload = { id: user.id, username: user.username };
    const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: "1h" });

    res.json({ token, userId: user.id });
  } catch (err) {
    console.error("Login Error:", err.message);
    res.status(500).send("Server error");
  }
}

async function getUserProfile(req, res) {
    try {
        // req.user is attached by the authMiddleware
        const user = await User.findById(req.user.id).select('-password').populate('repositories');
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }
        res.json(user);
    } catch (err) {
        console.error("Get Profile Error:", err.message);
        res.status(500).send("Server error");
    }
}

module.exports = { signup, login, getUserProfile };
