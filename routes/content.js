const express = require('express');
const app = express();
const router = express.Router();
const contentServices = require("./../services/content");

router.get("/categories/view", contentServices.queryCateTree, (req, res) => {
    res.render("admin/pages/categoriesTree");
})

router.get("/categories/tree", contentServices.queryCateTree, (req, res) => {
    res.send({
        data: res.locals.data.cateTree
    });
})

router.post("/categories/create", contentServices.createCate, contentServices.queryCateTree, (req, res) => {
    res.render("admin/pages/categoriesTree");
})

router.get("/categories/destory", contentServices.destoryCate, contentServices.queryCateTree, (req, res) => {
    res.render("admin/pages/categoriesTree");
})

router.get("/article/view", contentServices.queryArticleRecord,  (req, res) => {
    res.render("admin/pages/articleRecord");
})

router.post("/article/create", contentServices.createArticle, (req, res) => {
    res.redirect("admin/content/article/view");
});

router.post("/article/destory", contentServices.destoryArticle, (req, res) => {
    res.render("admin/pages/categories");
})

router.get("/article/recommend", contentServices.setArticleRecommend, (req, res) => {
    res.redirect("admin/content/article/view");
})


module.exports = router;