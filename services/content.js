const CateModel = require("./../models/categories");
const ArticleModel = require("./../models/article");
const Joi = require("joi");
const { setLocalsState } = require("../handler");
const CommentModel = require("./../models/comment");

module.exports.queryCateTree = async (req, res, next) => {
    try {
        const docs = await CateModel.find({});
        const data = docs.map((doc) => doc.toJSON());
        const root = data.filter((item) => !item.parentId);
        const find = (item, parent) => {
          parent.find((parentItem) => {
            if (parentItem._id.toJSON() === item.parentId.toJSON()) {
              parentItem.children = parentItem.children || [];
              parentItem.children.push(item);
            } else {
              if (parentItem.children) {
                find(item, parentItem.children);
              }
            }
          });
        };
    
        data.forEach((item) => {
          if (!item.parentId) {
            return;
          }
          find(item, root);
        });
    
        setLocalsState(res, {
          cateTree: root,
        });

        next();
      } catch (e) {
        next(e);
      }
};

module.exports.queryCateRecord = async (req, res, next) => {
  try {
      const docs = await CateModel.find({});
      const data = docs.map((doc) => doc.toJSON());

      setLocalsState(res, {
        cates: data,
      });

      next();
    } catch (e) {
      next(e);
    }
};

module.exports.queryPopularArticle = async (req, res, next) => {
  try {
      const docs = await ArticleModel.find({}).sort({createAt: 1}).limit(5);
      const data = docs.map((doc) => {
        return {
          ...doc.toJSON(),
          timeAgo: doc.timeAgo
        }
      });
      setLocalsState(res, {
        popular: data,
      });
      next();
    } catch (e) {
      next(e);
    }
};

/**
 * 查询单个文章
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
module.exports.queryArticle = async (req, res, next) => {
  try {
      const data = await ArticleModel.findById(req.params.id).populate("user");
      const commentCount = await CommentModel.countDocuments({articleId: req.params.id});
      setLocalsState(res, {
        article: {
          ...data.toJSON(),
          timeAgo: data.timeAgo,
          formattedCreatedAt: data.formattedCreatedAt,
          commentCount
        },
      });
      next();
    } catch (e) {
      next(e);
    }
};

module.exports.destoryCate = async (req, res, next) => {
  const schema = Joi.object({
    id: Joi.string().required(),
  });
  const result = schema.validate(req.query, {
    abortEarly: false,
    allowUnknown: true,
  });
  try {
    if (result.error) {
      throw new Error(result.error.details[0].message);
    }
    const cateDoc = await CateModel.findByIdAndDelete(result.value.id);
    if (!cateDoc) {
      throw new Error("删除分类失败");
    }
    next();
  } catch (e) {
    next(e);
  }
};

module.exports.createCate = async (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().required()
  });
  const result = schema.validate(req.body, {
    abortEarly: false,
    allowUnknown: true,
  });
  try {
    if (result.error) {
      throw new Error(result.error.details[0].message);
    }
    const cateModel = new CateModel({
      ...result.value
    });
    const cateDoc = await CateModel.create(cateModel);
    if (!cateDoc) {
      throw new Error("创建分类失败");
    }
    next();
  } catch (e) {
    next(e);
  }
};

module.exports.createArticle = async (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    cateId: Joi.string().required(),
    content: Joi.string().required(),
    desc: Joi.string().required()
  });
  const result = schema.validate(req.body, {
    abortEarly: false,
    allowUnknown: true,
  });
  try {
    if (result.error) {
      throw new Error(result.error.details[0].message);
    }
    const articleModel = new ArticleModel({
      ...result.value,
      cateId: result.value.cateId.split(","),
      user: req.userToken.oId,
    });
    const articleDoc = await ArticleModel.create(articleModel);
    if (!articleDoc) {
      throw new Error("添加文章失败");
    }
    next();
  } catch (e) {
    next(e);
  }
};

module.exports.destoryArticle = async (req, res, next) => {
  const schema = Joi.object({
    id: Joi.string().required()
  });
  const result = schema.validate(req.body, {
    abortEarly: false,
    allowUnknown: true,
  });
  try {
    if (result.error) {
      throw new Error(result.error.details[0].message);
    }
    const articleDoc = await ArticleModel.findByIdAndDelete(result.value.id);
    if (!articleDoc) {
      throw new Error("删除文章失败");
    }
    next();
  } catch (e) {
    next(e);
  }
};

module.exports.setArticleRecommend = async (req, res, next) => {
  const schema = Joi.object({
    id: Joi.string().required(),
    recommend: Joi.number().required(),
  });
  const result = schema.validate(req.query, {
    abortEarly: false,
    allowUnknown: true,
  });
  try {
    if (result.error) {
      throw new Error(result.error.details[0].message);
    }
    const articleResult = await ArticleModel.findByIdAndUpdate(result.value.id, {$set: {recommend: Number(result.value.recommend) }});
    if (!articleResult) {
      throw new Error("设置推荐状态失败");
    }
    next();
  } catch (e) {
    next(e);
  }
};

module.exports.queryRecommend = async (req, res, next) => {
  try {
    const recommend = await ArticleModel.find({recommend: 1});
    setLocalsState(res, {recommend});
    next();
  } catch (e) {
    next(e);
  }
};

module.exports.queryArticleRecord = async (req, res, next) => {
  const schema = Joi.object({
    
  });
  const result = schema.validate(req.query, {
    abortEarly: false,
    allowUnknown: true,
  });
  try {
    if (result.error) {
      throw new Error(result.error.details[0].message);
    }
    const data = await ArticleModel.paginateComments({}, {
       limit: Number(result.value.pageSize || 10) ,
       page: Number(result.value.pageNo || 1) 
    });
    setLocalsState(res, {
        articleRecord: data
    });
    next();
  } catch (e) {
    next(e);
  }
};

module.exports.submitComment = async (req, res, next) => {
  const schema = Joi.object({
     enterName: Joi.string().required(),
     articleId:  Joi.string().required(),
     message: Joi.string().required(),
     email: Joi.string().email().required(),
  });
  const result = schema.validate(req.body, {
    abortEarly: false,
    allowUnknown: true,
  });
  try {
    if (result.error) {
      throw new Error(result.error.details[0].message);
    }
    const commentModel = new CommentModel({
      ...result.value
    });
    const commentDoc = await CommentModel.create(commentModel);
    if (!commentDoc) {
      throw new Error("评论失败");
    }
    next();
  } catch (e) {
    next(e);
  }
};

module.exports.queryCommentRecord = async (req, res, next) => {
  const schema = Joi.object({
     id:  Joi.string().required()
  });
  const result = schema.validate(req.params, {
    abortEarly: false,
    allowUnknown: true,
  });
  try {
    if (result.error) {
      throw new Error(result.error.details[0].message);
    }
    const comments = await CommentModel.find({articleId: result.value.id});
    const data = comments.map(function(item) {
      return {
        ...item.toJSON(),
        formattedCreatedAt: item.formattedCreatedAt
      }  
    })
    if (!data) {
      throw new Error("评论失败");
    }
    setLocalsState(res, {comments: data});
    next();
  } catch (e) {
    next(e);
  }
};

module.exports.likeArticle = async (req, res, next) => {
  const schema = Joi.object({
    articleId:  Joi.string().required()
 });
 const result = schema.validate(req.query, {
   abortEarly: false,
   allowUnknown: true,
 });
  try {
    if (result.error) {
      throw new Error(result.error.details[0].message);
    }
    const tId = req?.touristToken?.tId;
    const articleDoc = await ArticleModel.findOne({ _id: req.query.articleId, "like.tId": tId});
    if (articleDoc) {
       throw new Error("该文章无须重新点赞");
    }
    const a = await ArticleModel.findByIdAndUpdate( result.value.articleId, { $set: {
      'like.tId': tId, // 更新details对象中的key1字段
      'like.status': 1
    }, 
    $inc: { "like.count": 1 }
    },  { new: true });
    next();
  } catch (e) {
    next(e);
  }
};
