const Router = require("express").Router;
const Message = require("../models/message");
const { ensureLoggedIn, ensureCorrectUser } = require("../middleware/auth");
const ExpressError = require("../expressError");

const router = new Router();

// GET /:id - get detail of message.
router.get("/:id", ensureLoggedIn, async function (req, res, next) {
  try {
    const message = await Message.get(req.params.id);

    // Check if the logged-in user is either the sender or receiver of the message
    if (
      req.user.username === message.from_user.username ||
      req.user.username === message.to_user.username
    ) {
      return res.json({ message });
    } else {
      throw new ExpressError("Unauthorized", 401);
    }
  } catch (err) {
    return next(err);
  }
});

// POST / - post message.
router.post("/", ensureLoggedIn, async function (req, res, next) {
  try {
    const { to_username, body } = req.body;

    const message = await Message.create({
      from_username: req.user.username,
      to_username,
      body,
    });

    return res.json({ message });
  } catch (err) {
    return next(err);
  }
});

// POST/:id/read - mark message as read:
router.post("/:id/read", ensureLoggedIn, async function (req, res, next) {
  try {
    const messageId = req.params.id;
    const message = await Message.get(messageId);

    // Check if the logged-in user is the recipient of the message
    if (req.user.username === message.to_user.username) {
      const markedMessage = await Message.markRead(messageId);
      return res.json({ message: markedMessage });
    } else {
      throw new ExpressError("Unauthorized", 401);
    }
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
