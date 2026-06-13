const express = require("express");
const router = express.Router();
const { db } = require("../db/init");

router.get("/", (req, res) => {
  if (!req.session.user) {
    return res.render("info", {
      title: "Info",
      message: "You do not have permission to view these forums.",
      back: true
    });
  }

  const categories = db.getCategoriesWithStats();
  const stats = db.getForumStats();
  res.render("index", { title: "Index", categories, stats });
});

module.exports = router;
