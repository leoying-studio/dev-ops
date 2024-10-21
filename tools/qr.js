const { exec } = require("child_process");
const fs = require("fs");
const utils = require("./utils");
const QRCode = require("qrcode");

const generateQR = async (content, toPath) => {
  utils.emptyDirSync(toPath);
  await QRCode.toFile(toPath, content);
  const [filepath] = utils.traverseFolder(toPath);
  return filepath;
};

module.exports.generateQR = generateQR;
