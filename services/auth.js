const ResourceModel = require("./../models/resource");
const RoleModel = require("./../models/role");
const Joi = require("joi");
const {
  secretKey,
  expirationTime,
  tokenKey,
} = require("./../config/auth.json");
const { setLocalsState } = require("../handler");

module.exports.resourceRecord = async (req, res, next) => {
  try {
    const docs = await ResourceModel.find({});
    const data = docs.map((doc) => doc.toJSON());
    const root = data.filter((item) => !item.parentId);

    const find = (item, parent) => {
      parent.find((parentItem) => {
        if (parentItem._id === item._id) {
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
      resourceRecord: root,
    });

    next();
  } catch (e) {
    next(e);
  }
};

module.exports.resourceAdd = async (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(10).required(),
  });
  const result = schema.validate(req.body, {
    abortEarly: false,
    allowUnknown: true,
  });
  try {
    if (result.error) {
      throw new Error(result.error.details[0].message);
    }
    const resourceModel = new ResourceModel({
      ...result.value,
    });
    const resourceDoc = await ResourceModel.create(resourceModel);
    if (!resourceDoc) {
      throw new Error("创建资源失败");
    }
    next();
  } catch (e) {
    next(e);
  }
};

module.exports.roleAdd = async (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(10).required(),
    resourceId: Joi.array().required(),
  });
  const result = schema.validate(req.body, {
    abortEarly: false,
    allowUnknown: true,
  });
  try {
    if (result.error) {
      throw new Error(result.error.details[0].message);
    }
    const roleModel = new RoleModel({
      ...result.value,
    });
    const roleDoc = await RoleModel.create(roleModel);
    if (!roleDoc) {
      throw new Error("创建角色失败");
    }
    next();
  } catch (e) {
    next(e);
  }
};

module.exports.roleRecord = async (req, res, next) => {
  try {
    const docs = await RoleModel.find({});
    const data = docs.map((doc) => doc.toJSON());

    setLocalsState(res, {
      roleRecord: data
    });

    next();
  } catch (e) {
    next(e);
  }
};
