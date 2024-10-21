const express = require('express');
const app = express();
const router = express.Router();
const deplay = require("../services/deplay");

router.get("sendGroup", (req, res) => {

});

router.post("/sass", deplay.deploy, (req, res) => {
    res.redirect("admin/projects/view/dash");
})

router.post("/project", deplay.deployByProjectConfig, (req, res) => {
    res.redirect("admin/projects/view/dash");
})

router.get("/record", deplay.record, (req, res) => {
    res.render("admin/pages/depolyRecord");
})

router.get("/view/form", (req, res) => {
    res.render("admin/pages/publishConfig");
})

router.get("qrcode", (req, res) => {
    // 使用示例
    // autoDeploy.generateQR();
});

module.exports = router;