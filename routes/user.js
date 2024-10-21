const user = require("./../services/user");
const express = require('express');
const app = express();
const router = express.Router();

router.get("/register/view", (req, res) => {
  // 使用示例
  res.render("admin/register");
});

router.get("/login/view", (req, res) => {
  // 使用示例
  res.render("admin/login", {});
});

router.get("/logout", user.logout, (req, res) => {
  // 使用示例
  res.redirect("/admin/user/login/view");
});

router.post("/login/submit", user.login, (req, res) => {
  // 使用示例
  res.redirect("/admin");
});

router.post("/register/submit", user.register, (req, res) => {
  // 使用示例
  res.redirect("admin/user/login/view");
});

module.exports = router;