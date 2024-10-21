const user = require("./../services/user");
const express = require('express');
const router = express.Router();

router.get("/", user.queryUserInfo, (req, res) => {
  res.render("admin/index");
});

module.exports = router;