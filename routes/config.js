const express = require('express');
const app = express();
const router = express.Router();
const config = require("../services/config");

router.get("/dict/view/record", config.queryDictRecord,(req, res) => {
    res.render("admin/pages/dictsetRecord");
})

router.get("/dict/options/destory",  config.destoryDictOption,(req, res) => {
    res.redirect("admin/config/dict/view/record");
})

router.get("/form/view/record", config.queryDictAll, config.queryFormRecord, (req, res) => {
    res.render("admin/pages/formRecord");
})

router.post("/dict/form/create", config.createDict, (req, res) => {
    res.redirect("admin/config/dict/view/record");
})

router.get("/dict/destory/:id", config.destoryDict, (req, res) => {
    res.redirect("admin/config/dict/view/record");
})

router.post("/dictEntity/form/create", config.createDictEntity, (req, res) => {
    res.redirect("admin/config/dict/view/record");
})

router.post("/form/create", config.createForm, (req, res) => {
    res.redirect("admin/config/form/view/record")
})

router.get("/form/destory", config.destoryForm, (req, res) => {
    res.redirect("admin/config/form/view/record")
})


router.post("/form/widget/create", config.createFormWidget, (req, res) => {
    res.redirect("admin/config/form/view/record")
})

router.post("/dict/form/update", (req, res) => {
    res.render("admin/dict");
})

module.exports = router;