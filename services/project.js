const Joi = require("joi");
const utils = require("./../utils");
const ProjectModel = require("../models/project");
const DictSetModel = require("../models/dictSet");
const FormModel = require("../models/form");
const { setLocalsState } = require("../handler");

module.exports.createProject = async (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(10).required(),
    desc: Joi.string().max(200),
    logo: Joi.string().max(200),
    formId: Joi.string().required(),
  });
  const result = schema.validate(req.body);
  try {
    if (result.error) {
      throw new Error(result.error.details[0].message);
    }
    const { formId } = result.value;
    const formDoc = await FormModel.findOne({ _id: formId });
    if (!formDoc) {
      throw new Error("暂未查询到表单信息");
    }

    const proModel = new ProjectModel({
      ...result.value,
      form: formId,
      user: req.userToken.oId,
    });
    const proDoc = await ProjectModel.create(proModel);
    if (!proDoc) {
      throw new Error("创建表单失败");
    }
    next();
  } catch (e) {
    next(e);
  }
};

module.exports.queryProjectDash = async (req, res, next) => {
  try {
    const data = await ProjectModel.paginate({isOpen: 0});
    const results = data.results || [];
    const dictsetsId = results
      .reduce((x, y) => {
        return [...x, ...(y.form?.widgets || [])];
      }, [])
      .map((item) => {
        return item.dictSet;
      });
    const docs = await DictSetModel.find({ _id: { $in: dictsetsId } });
    const dictSets = docs.map((item) => item.toJSON());
    results.forEach((item) => {
      const widgets = item?.form?.widgets || [];
      widgets.forEach((item) => {
        item.dictsetInfo = null;
        if (item.dictSet) {
          const dictId = item.dictSet.toJSON();
          const dictset = dictSets.find((dict) => dict._id.toJSON() === dictId);
          if (dictset) {
            item.dictsetInfo = dictset;
          }
        }
      });
    });
    setLocalsState(res, { projectRecord: data });
    next();
  } catch (e) {
    next(e);
  }
};

module.exports.queryProjectRecord = async (req, res, next) => {
  try {
    const data = await ProjectModel.paginate({});
    const results = data.results || [];
    const dictsetsId = results
      .reduce((x, y) => {
        return [...x, ...(y.form?.widgets || [])];
      }, [])
      .map((item) => {
        return item.dictSet;
      });
    const docs = await DictSetModel.find({ _id: { $in: dictsetsId } });
    const dictSets = docs.map((item) => item.toJSON());
    results.forEach((item) => {
      const widgets = item?.form?.widgets || [];
      item.formattedCreatedAt
      widgets.forEach((item) => {
        item.dictsetInfo = null;
        if (item.dictSet) {
          const dictId = item.dictSet.toJSON();
          const dictset = dictSets.find((dict) => dict._id.toJSON() === dictId);
          if (dictset) {
            item.dictsetInfo = dictset;
          }
        }
      });
    });
    setLocalsState(res, { projectRecord: data });
    next();
  } catch (e) {
    next(e);
  }
};

module.exports.destoryProject = async (req, res, next) => {
  const schema = Joi.object({
    id: Joi.string().required(),
  });
  const result = schema.validate(req.params);
  try {
    if (result.error) {
      throw new Error(result.error.details[0].message);
    }
    const doc = await ProjectModel.findByIdAndDelete(result.value.id);
    if (!doc) {
      throw new Error("删除项目失败");
    }
    next();
  } catch (e) {
    next(e);
  }
};

module.exports.saveProjectForm = async (req, res, next) => {
  const schema = Joi.object(
    {
      id: Joi.string().required(),
    }
  );
  const validate = schema.validate(req.body,  { abortEarly: false, allowUnknown: true });
  try {
    if (validate.error) {
      throw new Error(validate.error.details[0].message);
    }
    const doc = await ProjectModel.findById(validate.value.id).populate("form");
    if (!doc) {
      throw new Error("项目不存在");
    }
    const formJSON = doc.form.toJSON();
    const widgetsSchema = formJSON.widgets.reduce((x, y) => {
      return {
        ...x,
        [y.value]: Joi.string().required(),
      };
    }, {});
    const widgetValidate = Joi.object(widgetsSchema);
    const result = widgetValidate.validate(req.body, {
      abortEarly: false,
      allowUnknown: true,
    });
    if (result.error) {
      throw new Error(result.error.details[0].message);
    }
    const updateDoc = await ProjectModel.updateOne({_id: result.value.id}, {
      $set: {
        formFieldsValue: result.value
      }
    });
    if (updateDoc) {
      next();
    }
  } catch (e) {
    next(e);
  }
};

module.exports.switchProject = async (req, res, next) => {
  const schema = Joi.object(
    {
      id: Joi.string().required(),
      isOpen: Joi.number().required()
    }
  );
  const validate = schema.validate(req.query,  { abortEarly: false, allowUnknown: true });
  try {
    if (validate.error) {
      throw new Error(validate.error.details[0].message);
    }
    // 1 是关， 0是开
    const doc = await ProjectModel.updateMany({}, { $set: {
      isOpen: 1
    }});
    const updateDoc = await ProjectModel.updateOne({ _id: validate.value.id  }, { $set: {
      isOpen: validate.value.isOpen
    }});
    if (!updateDoc.modifiedCount) {
      throw new Error("操作失败...");
    }
    next();
  } catch (e) {
    next(e);
  }
};
