const express = require("express");
const router = express.Router();
const { db } = require("../db/init");

function requireAuth(req, res, next) {
  if (!req.session.user) {
    return res.status(403).render("info", {
      title: "Info",
      message: "You do not have permission to view these forums.",
      back: true
    });
  }
  next();
}

router.use(requireAuth);

router.get("/category/:id", (req, res) => {
  const category = db.getCategory(req.params.id);
  if (!category) return res.status(404).render("info", { title: "Info", message: "Category not found.", back: true });

  const threads = db.getThreadsByCategory(req.params.id);
  res.render("category", { title: category.title, category, threads });
});

router.get("/category/:id/new", (req, res) => {
  const category = db.getCategory(req.params.id);
  if (!category) return res.status(404).render("info", { title: "Info", message: "Category not found.", back: true });
  res.render("new-thread", { title: "Post new topic", category, error: null });
});

router.post("/category/:id/new", (req, res) => {
  const category = db.getCategory(req.params.id);
  if (!category) return res.status(404).render("info", { title: "Info", message: "Category not found.", back: true });

  const title = (req.body.title || "").trim();
  const body = (req.body.body || "").trim();

  if (!title || !body) {
    return res.status(400).render("new-thread", { title: "Post new topic", category, error: "Topic title and message are required." });
  }

  const thread = db.createThread(category.id, req.session.user.id, title, body);
  res.redirect(`/forum/thread/${thread.id}`);
});

router.get("/thread/:id", (req, res) => {
  const thread = db.getThread(req.params.id);
  if (!thread) return res.status(404).render("info", { title: "Info", message: "Thread not found.", back: true });

  const posts = db.getPostsByThread(req.params.id);
  res.render("thread", { title: thread.title, thread, posts });
});

router.post("/thread/:id/reply", (req, res) => {
  const body = (req.body.body || "").trim();
  if (body) {
    db.createPost(req.params.id, req.session.user.id, body);
  }
  res.redirect(`/forum/thread/${req.params.id}`);
});

module.exports = router;
