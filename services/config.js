const Joi = require("joi");
const utils = require("./../utils");
const DictSetModal = require("../models/dictSet");
const FormModel = require("../models/form");
const { setLocalsState } = require("../handler");
const TypeEnumValue = {
  1: 'input',
  2: 'checkbox',
  3: 'radio',
  4: 'textarea',
  5: 'select',
  6: 'img',
  7: 'date'
};


module.exports.createDictSet = async (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(10).required(),
    options: Joi.array()
      .items(
        Joi.object().keys({
          key: Joi.string().required(),
          value: Joi.number().required(),
        })
      )
      .required(),
  });
  const { key, value, name } = req.body;
  const likeKey = Array.isArray(key) ? key : [key];
  const likeValue = Array.isArray(value) ? value : [value];
  const body = {
    name,
    options: likeKey.map((key, index) => {
      return {
        key,
        value: likeValue[index],
      };
    }),
  };
  const result = schema.validate(body);
  try {
    if (result.error) {
      throw new Error(result.error.details[0].message);
    }
    const dictSetModel = new DictSetModal(body);
    const dictSetDoc = await DictSetModal.create(dictSetModel);
    if (!dictSetDoc) {
      throw new Error("创建字典失败");
    }
    next();
  } catch (e) {
    next(e);
  }
};

module.exports.createDict = async (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(10).required(),
    desc: Joi.string().max(200),
  });
  const result = schema.validate(req.body, { abortEarly: false, allowUnknown: true });
  try {
    if (result.error) {
      throw new Error(result.error.details[0].message);
    }
    const dictSetModel = new DictSetModal({
      ...result.value,
      options: [],
    });
    const dictSetDoc = await DictSetModal.create(dictSetModel);
    if (!dictSetDoc) {
      throw new Error("创建字典失败");
    }
    next();
  } catch (e) {
    next(e);
  }
};

module.exports.createDictEntity = async (req, res, next) => {
  const schema = Joi.object({
    dictSet: Joi.string().required(),
    key: Joi.string().min(2).max(10).required(),
    value: Joi.number().required(),
  });
  const result = schema.validate(req.body);
  try {
    if (result.error) {
      throw new Error(result.error.details[0].message);
    }
    const dictSetDoc = await DictSetModal.findOne({
      _id: result.value.dictSet,
    });
    if (!dictSetDoc) {
      throw new Error("当前字典不存在");
    }
    dictSetDoc.options.push(result.value);
    const coll = await dictSetDoc.save();
    if (!coll) {
      throw new Error("添加字典控件失败");
    }
    next();
  } catch (e) {
    next(e);
  }
};

module.exports.destoryDict = async (req, res, next) => {
  const schema = Joi.object({
    id: Joi.string().required(),
  });
  const result = schema.validate(req.params);
  try {
    if (result.error) {
      throw new Error(result.error.details[0].message);
    }
    const doc = await DictSetModal.findByIdAndDelete(result.value.id);
    if (!doc) {
      throw new Error("删除字典失败");
    }
    next();
  } catch (e) {
    next(e);
  }
};

module.exports.destoryDictOption = async (req, res, next) => {
  const schema = Joi.object({
    dictsetId: Joi.string().required(),
    optionId: Joi.string().required(),
  });
  const result = schema.validate(req.query);
  try {
    if (result.error) {
      throw new Error(result.error.details[0].message);
    }
    const dictSetDoc = await DictSetModal.findById(
      result.value.dictsetId
    )
    if (!dictSetDoc) {
      throw new Error('dictSetDoc document not found');
    }
    dictSetDoc.options.pull(result.value.optionId);

    // 保存父文档
    await dictSetDoc.save();

    next();
  } catch (e) {
    next(e);
  }
};

module.exports.queryDictRecord = async (req, res, next) => {
  try {
    const data = await DictSetModal.paginate(req.body);
    setLocalsState(res, {dictRecord: data})
    next();
  } catch (e) {
    next(e);
  }
};

module.exports.queryDictAll = async (req, res, next) => {
  try {
    const data = await DictSetModal.find({});
    setLocalsState(res, {
       dictAll: data.map((item) => {
        return item.toObject();
      })
    })
    next();
  } catch (e) {
    next(e);
  }
};

module.exports.createFormFull = async (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(10).required(),
    widgets: Joi.array()
      .items(
        Joi.object().keys({
          label: Joi.string().required(),
          type: Joi.number().required(),
          dictSet: Joi.string().required(),
        })
      )
      .required(),
  });
  const { label, type, dictSet, name } = req.body;
  const [likeDictSet, likeLabel, likeType] = utils.markLikeArray(
    dictSet,
    label,
    type
  );
  const body = {
    name,
    widgets: likeLabel.map((label, index) => {
      return {
        label,
        type: likeType[index],
        dictSet: likeDictSet[index],
      };
    }),
  };
  const result = schema.validate(body);
  try {
    if (result.error) {
      throw new Error(result.error.details[0].message);
    }
    // 验证传入的字典是否已经存在
    const dictSetIds = result.value.widgets.map((item) => item.dictSet);
    const dictSetDocs = await DictSetModal.find({
      _id: {
        $in: dictSetIds,
      },
    });
    const existingIds = dictSetDocs.map((doc) => {
      return doc._id.toString();
    });
    const diffIds = utils.difference(existingIds, dictSetIds);
    if (diffIds.length) {
      throw new Error(`当前字典的id不存在，请检查${JSON.stringify(diffIds)}`);
    }
    const formModel = new FormModel(body);
    const formDoc = await FormModel.create(formModel); 
    if (!formDoc) {
      throw new Error("创建表单失败");
    }
    next();
  } catch (e) {
    next(e);
  }
};

module.exports.createForm = async (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(10).required(),
    desc: Joi.string().min(2).max(200).required(),
  });
  const result = schema.validate(req.body);
  try {
    if (result.error) {
      throw new Error(result.error.details[0].message);
    }
    // 验证传入的字典是否已经存在
    const formModel = new FormModel(result.value);
    const formDoc = await FormModel.create(formModel); 
    if (!formDoc) {
      throw new Error("创建表单失败");
    }
    next();
  } catch (e) {
    next(e);
  }
};

module.exports.createFormWidget = async (req, res, next) => {
  const schema = Joi.object({
    formId: Joi.string().required(),
    label: Joi.string().min(2).max(10).required(),
    type: Joi.string().required(),
    value: Joi.string().required(),
  });
  const result = schema.validate(req.body, {allowUnknown: true});

  try {
    if (TypeEnumValue[result.value.type] === 'radio' || TypeEnumValue[result.value.type] === 'select') {
      const schema = Joi.object({
        dictSet: Joi.string().required().error(new Error("请选择字典"))
      });
      const result = schema.validate(req.body);
      if (result.error) {
        throw new Error(result.error.details[0].message);
      }
    }
    if (result.error) {
      throw new Error(result.error.details[0].message);
    }
    // 验证传入的字典是否已经存在
    const {formId} = result.value;
    const formDoc = await FormModel.findByIdAndUpdate(formId, { $push: { widgets: result.value } });
    if (!formDoc) {
      throw new Error(`当前表单的id不存在}`);
    }
    next();
  } catch (e) {
    next(e);
  }
};

module.exports.queryFormRecord = async (req, res, next) => {
  try {
    const data = await FormModel.paginate(req.body);
    setLocalsState(res, {formRecord: data})
    next();
  } catch (e) {
    next(e);
  }
};

module.exports.queryFormAll = async (req, res, next) => {
  try {
    const data = await FormModel.find({});
    setLocalsState(res, {
       formAll: data.map((item) => {
        return item.toObject();
      })
    })
    next();
  } catch (e) {
    next(e);
  }
};

module.exports.destoryForm = async (req, res, next) => {
  const schema = Joi.object({
    formId: Joi.string().required()
  });
  const result = schema.validate(req.query);
  try {
    if (result.error) {
      throw new Error(result.error.details[0].message);
    }
    // 验证传入的字典是否已经存在
    const {formId} = result.value;
    const formDoc = await FormModel.findByIdAndDelete({_id: formId});
    if (!formDoc) {
      throw new Error(`当前表单的id不存在}`);
    }
    next();
  } catch (e) {
    next(e);
  }
};