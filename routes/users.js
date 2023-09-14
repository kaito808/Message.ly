// User routes for custom user management

const ExpressRouter = require("express").Router;
const CustomUserModel = require("../models/customUserModel");
const {
  ensureLoggedIn,
  ensureCorrectUser,
} = require("../middleware/customAuth");

const userRoute = new ExpressRouter();

// Get list of users
userRoute.get("/", ensureLoggedIn, async function (req, res, next) {
  try {
    let users = await CustomUserModel.getAllUsers();
    return res.json({ users });
  } catch (err) {
    return next(err);
  }
});

// Get user details
userRoute.get("/:username", ensureCorrectUser, async function (req, res, next) {
  try {
    let user = await CustomUserModel.getUserByUsername(req.params.username);
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});

// Get messages to a user
userRoute.get(
  "/:username/to",
  ensureCorrectUser,
  async function (req, res, next) {
    try {
      let messages = await CustomUserModel.getMessagesToUser(
        req.params.username
      );
      return res.json({ messages });
    } catch (err) {
      return next(err);
    }
  }
);

// Get messages from a user
userRoute.get(
  "/:username/from",
  ensureCorrectUser,
  async function (req, res, next) {
    try {
      let messages = await CustomUserModel.getMessagesFromUser(
        req.params.username
      );
      return res.json({ messages });
    } catch (err) {
      return next(err);
    }
  }
);

module.exports = userRoute;
