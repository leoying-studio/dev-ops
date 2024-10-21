const express = require("express");
const router = express.Router();
const contentServices = require("./../services/content");

router.get(
  "/",
  contentServices.queryArticleRecord,
  contentServices.queryRecommend,
  contentServices.queryCateRecord,
  contentServices.queryPopularArticle,
  (req, res) => {
    res.render("www/index");
  }
);

router.get(
  "/detail/:id",
  contentServices.queryArticleRecord,
  contentServices.queryRecommend,
  contentServices.queryCateRecord,
  contentServices.queryPopularArticle,
  contentServices.queryArticle,
  contentServices.queryCommentRecord,
  (req, res) => {
    res.render("www/details");
  }
);

router.post(
  "/comment/submit",
  contentServices.submitComment,
  (req, res) => {
    res.redirect(`/detail/${req.body.articleId}`);
  }
);

router.get(
  "/article/like",
  contentServices.likeArticle,
  (req, res) => {
    res.redirect(`/detail/${req.query.articleId}`);
  }
);


module.exports = router;
