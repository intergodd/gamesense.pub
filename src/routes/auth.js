const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();
const { db } = require("../db/init");

router.get("/login", (req, res) => {
  res.render("login", { title: "Login", error: null });
});

router.post("/login", (req, res) => {
  const { username, password } = req.body;
  const user = db.getUserByUsername((username || "").trim());

  if (!user || !bcrypt.compareSync(password || "", user.password_hash)) {
    return res.status(401).render("login", { title: "Login", error: "Invalid username or password." });
  }

  req.session.user = { id: user.id, username: user.username, role: user.role };
  res.redirect("/");
});

router.get("/register", (req, res) => {
  res.render("register", { title: "Register", error: null, invite: "" });
});

router.post("/register", (req, res) => {
  const { invite_key, username, password, password_confirm, email, human_check } = req.body;
  const cleanInvite = (invite_key || "").trim();
  const cleanUsername = (username || "").trim();

  if (!cleanInvite || !cleanUsername || !password || !password_confirm || !email) {
    return res.status(400).render("register", { title: "Register", error: "All required fields must be filled.", invite: cleanInvite });
  }

  if (!/^[a-zA-Z0-9_]{3,25}$/.test(cleanUsername)) {
    return res.status(400).render("register", { title: "Register", error: "Username must be alphanumeric and between 3 and 25 characters.", invite: cleanInvite });
  }

  if (password.length < 6) {
    return res.status(400).render("register", { title: "Register", error: "Password must be at least 6 characters.", invite: cleanInvite });
  }

  if (password !== password_confirm) {
    return res.status(400).render("register", { title: "Register", error: "Passwords do not match.", invite: cleanInvite });
  }

  if (!human_check) {
    return res.status(400).render("register", { title: "Register", error: "Please confirm that you are not a robot.", invite: cleanInvite });
  }

  const invite = db.getInvite(cleanInvite);
  if (!invite) {
    return res.status(400).render("register", { title: "Register", error: "Invalid or already used invite key.", invite: cleanInvite });
  }

  const exists = db.getUserByUsername(cleanUsername);
  if (exists) {
    return res.status(400).render("register", { title: "Register", error: "Username already exists.", invite: cleanInvite });
  }

  const hash = bcrypt.hashSync(password, 10);
  const user = db.createUser(cleanUsername, hash);
  db.useInvite(invite.id, user.id);

  req.session.user = { id: user.id, username: user.username, role: user.role };
  res.redirect("/");
});

router.post("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/"));
});

module.exports = router;
