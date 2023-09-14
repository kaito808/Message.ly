// Authentication routes for user management

const jwtToken = require("jsonwebtoken");
const ExpressRoute = require("express").Router;
const authRoute = new ExpressRoute();

const CustomUserModel = require("../models/customUserModel");
const { CUSTOM_SECRET_KEY } = require("../customConfig");
const AppError = require("../AppError");

// User login route
authRoute.post("/login", async function (req, res, next) {
  try {
    let { username, password } = req.body;
    if (await CustomUserModel.authenticateUser(username, password)) {
      let token = jwtToken.sign({ username }, CUSTOM_SECRET_KEY);
      CustomUserModel.updateLoginTimestamp(username);
      return res.json({ token });
    } else {
      throw new AppError("Invalid username/password", 400);
    }
  } catch (err) {
    return next(err);
  }
});

// User registration route
authRoute.post("/register", async function (req, res, next) {
  try {
    let { username } = await CustomUserModel.signUpUser(req.body);
    let token = jwtToken.sign({ username }, CUSTOM_SECRET_KEY);
    CustomUserModel.updateLoginTimestamp(username);
    return res.json({ token });
  } catch (err) {
    return next(err);
  }
});

module.exports = authRoute;
