const { queryFormAll } = require("../services/config");
const { createProject, queryProjectRecord, destoryProject, saveProjectForm, switchProject, queryProjectDash } = require("../services/project");
const user = require("./../services/user");
const express = require('express');
const router = express.Router();

router.get("/view/record", queryProjectRecord, queryFormAll, (req, res) => {
  res.render("admin/pages/projectRecord");
});

router.get("/view/dash", queryProjectDash, queryFormAll, (req, res) => {
    res.render("admin/pages/projectDash");
});

router.get("/destory/:id", destoryProject, (req, res) => {
  res.render("admin/projects/view/record");
});

router.post("/post/create", createProject, (req, res) => {
  res.redirect("admin/projects/view/record"); 
});

router.post("/save/form", saveProjectForm, (req, res) => {
  res.redirect("admin/projects/view/record");
});

router.get("/query/switch", switchProject, (req, res) => {
  res.redirect("admin/projects/view/record");
});

module.exports = router;