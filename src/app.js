const path = require("path");
const express = require("express");
const session = require("express-session");

const { initDb } = require("./db/init");
const indexRoutes = require("./routes/index");
const authRoutes = require("./routes/auth");
const forumRoutes = require("./routes/forum");
const userRoutes = require("./routes/users");

const app = express();
const PORT = process.env.PORT || 3000;

initDb();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "change-this-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7
    }
  })
);

app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.siteName = "gamesense";
  res.locals.year = new Date().getFullYear();
  next();
});

app.use("/", indexRoutes);
app.use("/", authRoutes);
app.use("/forum", forumRoutes);
app.use("/user", userRoutes);

app.get("/search", (req, res) => res.render("info", { title: "Search", message: "Search is not implemented yet.", back: true }));
app.get("/pm", (req, res) => res.render("info", { title: "PM", message: "Private messages are not implemented yet.", back: true }));
app.get("/premium", (req, res) => res.render("info", { title: "Premium", message: "Premium page is not implemented yet.", back: true }));
app.get("/faq", (req, res) => res.render("info", { title: "FAQ", message: "Frequently asked questions are not implemented yet.", back: true }));
app.get("/common-issues", (req, res) => res.render("info", { title: "Common issues", message: "Common issues page is not implemented yet.", back: true }));
app.get("/discord", (req, res) => res.render("info", { title: "Support discord", message: "Support discord link is not configured yet.", back: true }));

app.use((req, res) => {
  res.status(404).render("info", {
    title: "Not found",
    message: "The requested page could not be found.",
    back: true
  });
});

app.listen(PORT, () => {
  console.log(`Forum running at http://localhost:${PORT}`);
});
