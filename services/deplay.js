const Sftp = require("../tools/sftp");
const command = require("../tools/command");
const utils = require("../utils");
const qw = require("../tools/qw");
const remoteConfig = require("./../config/server");
const nodepath = require("path");
const DeployModel = require("../models/deploy");
const ProjectModel = require("../models/project");
const Joi = require("joi");
const { setLocalsState } = require("../handler");
const BASE_URL = "d:/publicworks/";

const joinFullPath = (projectName) => {
  return `${BASE_URL}${projectName}`;
};

module.exports.sendToGroup = async () => {
  const fullpath = joinFullPath("yoga-sass");
  process.chdir(fullpath);
  await command.exec(["pnpm build", "pnpm tar"]);
  const folder = nodepath.resolve(fullpath, "archive");
  const [filepath] = utils.traverseFolder(folder);
  await qw.sendFileToWeChatGroup(filepath);
  qw.sendTextToEnterpriseWeChatGroup("发包完成");
};

module.exports.deploy = async (req, res, next) => {
  const schema = Joi.object({
    desc: Joi.string().min(8).max(500)
  });
  try {
    const result = schema.validate(req.body);
    if (result.error) {
      throw new Error(result.error.details[0].message);
    }
    const fullpath = joinFullPath("yoga-sass");
    process.chdir(fullpath);
    await command.exec(["pnpm tar"]);
    const fileFolder = BASE_URL + `yoga-sass/archive`;
    const [filepath = ""] = utils.traverseFolder(fileFolder);
    const [fileName = ""] = filepath.split("\\").slice(-1);
    const sftp = new Sftp();
    await sftp.uploadDir(remoteConfig, fileFolder);
    await sftp.rmdir(remoteConfig, remoteConfig.path + "/dist");
    await sftp.untargz(remoteConfig, fileName);
    sftp.close();
    qw.sendTextToEnterpriseWeChatGroup(
      ` nginx 正式环境发布完成
          ${result?.value?.desc}
      `,
    );
    const doc = await new DeployModel({
      user: req.userToken.oId,
      ...result.value
    }).save();

    if (doc) {
      next();
    }
  } catch (e) {
    next(e);
  }
};

module.exports.deployByProjectConfig = async (req, res, next) => {
  const schema = Joi.object({
    desc: Joi.string().min(8).max(500)
  });
  try {
    const result = schema.validate(req.body, { abortEarly: false, allowUnknown: true });
    if (result.error) {
      throw new Error(result.error.details[0].message);
    }
    //  1 是关， 0是开
    const openStatusDoc = await ProjectModel.findOne({isOpen: 0}).populate("user form");
    if (!openStatusDoc) {
      throw new Error("没有查询到开启的文档信息");
    }
    const projectJSON = openStatusDoc.toJSON();
    const serverSchema = Joi.object({
      projectName:  Joi.string().required().error(new Error("缺少项目名称")),
      archive:  Joi.string().required().error(new Error("缺少存档路径")),
      host:  Joi.string().required().error(new Error("缺少host地址")),
      username:  Joi.string().required().error(new Error("缺少服务器用户名")),
      path:  Joi.string().required().error(new Error("缺少服务器路径")),
      port:  Joi.string().required().error(new Error("缺少服务器端口")),
      password:  Joi.string().required().error(new Error("缺少服务器密码"))
    });
    const serveValid = serverSchema.validate(projectJSON.formFieldsValue, { abortEarly: false, allowUnknown: true });
    if (serveValid.error) {
      throw new Error(serveValid.error.details[0].message);
    }
    const fullpath = joinFullPath(serveValid.value.projectName);
    process.chdir(fullpath);
    await command.exec(["pnpm tar"]);
    const fileFolder = BASE_URL + `${serveValid.value.projectName}/${serveValid.value.archive}`;
    const [filepath = ""] = utils.traverseFolder(fileFolder);
    const [fileName = ""] = filepath.split("\\").slice(-1);
    const sftp = new Sftp();
    const remoteConfig =  {
          "host": serveValid.value.host,
          "username": serveValid.value.username,
          "path": serveValid.value.path,
          "port": serveValid.value.port,
          "password": serveValid.value.password
    }
    await sftp.uploadDir(remoteConfig, fileFolder);
    await sftp.rmdir(remoteConfig, remoteConfig.path + "/dist");
    await sftp.untargz(remoteConfig, fileName);
    sftp.close();
    qw.sendTextToEnterpriseWeChatGroup(
      ` nginx 正式环境发布完成
          ${result?.value?.desc}
      `,
    );
    const doc = await new DeployModel({
      user: req.userToken.oId,
      ...result.value
    }).save();

    if (doc) {
      next();
    }
  } catch (e) {
    next(e);
  }
};

module.exports.record = async(req, res, next) => {
  try {
    const data = await DeployModel.paginate({});
    setLocalsState(res, {deployRecord: data});
    next();
  } catch(e) {
     next(e);
  }
}