const ArticleModel = require("./../models/article");
const CateModel = require("./../models/categories");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const {
  secretKey,
  expirationTime,
  tokenKey,
} = require("./../config/auth.json");

module.exports.login = async (req, res, next) => {
  const schema = Joi.object({
    userName: Joi.string().min(2).max(10).required(),
    password: Joi.string().min(8).max(8).required(),
  });
  const result = schema.validate(req.body);
  try {
    if (result.error) {
      throw new Error(result.error.details[0].message);
    }
    const userDoc = await UserModel.findOne({
      userName: result.value.userName,
      password: result.value.password,
    });
    if (!userDoc) {
      throw new Error("用户不存在，或密码错误");
    }

    // 生成Token
    const payload = {
      // 你的payload数据，比如用户ID
      oId: userDoc._id,
    };
    // Token有效时长/*  */
    const options = {
      expiresIn: expirationTime,
    };/*  */
    const token = jwt.sign(payload, secretKey, options);
    res.cookie(tokenKey, token, { maxAge: expirationTime });
    
    next();
  } catch (e) {
    next(e);
  }
};

// 向数据库添加数据
module.exports.register = async (req, res, next) => {
  const schema = Joi.object({
    userName: Joi.string().required().min(2).max(10),
    nickName: Joi.string().required().min(2).max(10),
    password: Joi.string().required().length(8).required(),
    passwordAgain: Joi.string()
      .required()
      .length(8)
      .valid(Joi.ref("password"))
      .options({
        messages: { "any.only": "两次密码输入不一致" },
      }),
  });
  const result = schema.validate(req.body);
  try {
    if (result.error) {
      throw new Error(result.error.details[0].message);
    }
    const queryUser = await UserModel.findOne({
      userName: result.value.userName,
    });
    if (queryUser) {
      throw new Error("当前用户已存在");
    }
    const userDoc = new UserModel(result.value);
    const user = await UserModel.create(userDoc);
    if (user) {
      next();
    }
  } catch (e) {
    next(e);
  }
};

module.exports.queryUserInfo = async (req, res, next) => {
  try {
    const objectId = req?.userToken?.oId;
    if (objectId) {
      const user = await UserModel.findOne({ _id: objectId });
      const data = res.locals?.data || {};
      data.user = user.toObject();
      res.locals.data = data;
    }
    next();
  } catch (e) {
    throw new Error(e);
  }
};

module.exports.logout = (req, res, next) => {
  res.clearCookie(tokenKey);
  req.userInfo = null;
  req.userToken = null;
  next();
};
