const { generateUniqueId } = require("../utils");
const {
  secretKey,
  expirationTime,
  tokenKey,
} = require("./../config/tourist.json");
const jwt = require("jsonwebtoken");

module.exports.mark = async (req, res, next) => {
  const cookies = req.cookies;
  if (cookies[tokenKey]) {
    const touristToken = jwt.verify(cookies[tokenKey], secretKey);
    if (touristToken) {
      req.touristToken = touristToken;
      next();
      return;
    }
  }

  try {
    // 生成Token
    const payload = {
      // 你的payload数据，比如用户ID
      tId: Date.now() + generateUniqueId(),
    };
    // Token有效时长/*  */
    const options = {
      expiresIn: expirationTime,
    }; /*  */
    const token = jwt.sign(payload, secretKey, options);
    res.cookie(tokenKey, token, { maxAge: expirationTime });

    next();
  } catch (e) {
    next(e);
  }
};
