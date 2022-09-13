require("dotenv").config();

const { Router } = require("express");
const router = Router();
const jwt = require("jsonwebtoken");
const User = require("../models/user");
// const generateAccessToken =require('../middleware/autheniticateToken');
let refreshTokens = [];

router.post("/token", (req, res) => {
  const refreshToken = req.body.token;
  if (refreshToken == null) return res.sendStatus(401);
  if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403);
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    const accessToken = generateAccessToken({ name: user.name });
    res.json({ accessToken: accessToken });
  });
});

router.delete("/logout", (req, res) => {
  refreshTokens = refreshTokens.filter((token) => token !== req.body.token);
  res.sendStatus(204);
});

router.post("/login", async (req, res) => {
  // Authenticate User

  const username = req.body.username;
  const user = User({
    userName: req.body.username,
    email: req.body.email,
  });

  const existingUser = await User.findOne({ email: req.body.email });
  if (existingUser) {
    const accessToken = generateAccessToken(existingUser);
    const refreshToken = jwt.sign(existingUser, process.env.REFRESH_TOKEN_SECRET);
    refreshTokens.push(refreshToken);
    return res.status(200).json({
      userName: existingUser.username,
      email: existingUser.email,
      accessToken: accessToken,
      refreshToken: refreshToken,
    });
  } else {
    await new User({ ...req.body }).save();
    const newUser = await User.findOne({ email: req.body.email });
    return res
      .status(201)
      .json({
        userName: newUser.username,
        email: newUser.email,
        accessToken: accessToken,
        refreshToken: refreshToken,
        message: "Account created sucessfully",
      });
  }
});

function generateAccessToken(user) {
  return jwt.sign(user.toJSON(), process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15s" });
}
module.exports = router;
