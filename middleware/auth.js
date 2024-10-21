const jwt = require("jsonwebtoken");
const { secretKey, tokenKey } = require("../config/auth.json");

// 创建JWT登录拦截中间件
const jwtAuth = (req, res, next) => {
  if (req.url.includes("/admin")) {
    if (req.url.includes("/login/")) {
      next();
      return;
    }
    try {
      const cookies = req.cookies;
      const userToken = jwt.verify(cookies[tokenKey], secretKey);
      req.userToken = userToken;
      next();
    } catch {
      throw new Error("UnauthorizedError");
    }
  } else {
    next()
  }
};

module.exports.jwtAuth = jwtAuth;
