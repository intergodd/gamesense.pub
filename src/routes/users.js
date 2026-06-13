const express = require("express");
const router = express.Router();
const { db } = require("../db/init");

router.get("/:username", (req, res) => {
  const profile = db.getUserByUsername(req.params.username);
  if (!profile) {
    return res.status(404).render("info", { title: "Info", message: "User not found.", back: true });
  }

  const stats = db.getUserStats(profile.id);
  res.render("profile", { title: profile.username, profile, stats });
});

module.exports = router;
