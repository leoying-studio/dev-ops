module.exports.setLocalsDefault = (req, res, next) => {
  res.locals.code = 200;
  res.locals.err = "";
  res.locals.data = {};
  next();
};

module.exports.setLocalsState = function (res, state) {
  Object.entries(state).forEach(([key, value]) => {
    res.locals.data[key] = value;
  });
};
