require("dotenv").config();

const { Router } = require("express");
const router = Router();
const jwt = require("jsonwebtoken");
const User = require("../models/user");

let refreshTokens = [];

router.post("/token", (req, res) => {
  const refreshToken = req.body.token;
  console.log(req.body.token);
  const interestingItems = new Set(refreshTokens)
const isItemInSet = interestingItems.has(req.body.token)
console.log(isItemInSet);
  console.log(refreshTokens.includes(refreshToken));
  if (refreshToken == null) return res.sendStatus(401);
  if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403);
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    console.log(err);
    if (err) return res.json({error:err}).sendStatus(403);
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
    const refreshToken = jwt.sign(
      existingUser.toJSON(),
      process.env.REFRESH_TOKEN_SECRET
    );
    refreshTokens.push(refreshToken);
    console.log(refreshToken);
    console.log(refreshTokens.length);
    return res.status(200).json({
      userName: existingUser.userName,
      email: existingUser.email,
      accessToken: accessToken,
      refreshToken: existingUser.token,
      message: "Login success",
    });
  } else {
    const newUser = User({
      userName: req.body.userName,
      email: req.body.email,
    });
    const refreshToken = jwt.sign(
      newUser.toJSON(),
      process.env.REFRESH_TOKEN_SECRET
    );
    await User({
      userName: req.body.userName,
      email: req.body.email,
      token: refreshToken,
    }).save();
   
    const existingUser = await User.findOne({ email: req.body.email });
    console.log(existingUser);
    const accessToken = generateAccessToken(existingUser);

    return res.status(201).json({
      userName: existingUser.userName,
      email: existingUser.email,
      accessToken: accessToken,
      refreshToken: existingUser.token,
      message: "Account created sucessfully",
    });
  }
});

function generateAccessToken(user) {
  return jwt.sign(user.toJSON(), process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15s",
  });
}
module.exports = router;
