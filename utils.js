const fs = require("fs");
const path = require("path");

function traverseFolder(folderPath) {
  let wjm = [];

  // 读取文件夹列表

  const files = fs.readdirSync(folderPath);

  // 遍历文件夹列表

  files.forEach(function (fileName) {
    // 拼接当前文件路径

    const filePath = path.join(folderPath, fileName);

    // 判断该路径是文件夹还是文件

    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      // 如果是文件夹，递归遍历
      // traverseFolder(filePath)
    } else {
      // 如果是文件，执行操作

      console.log(filePath);

      // 数组 添加 元素

      wjm.push(filePath);
    }
  });
  return wjm;
}

function generateUniqueId() {
  const timestamp = Date.now().toString(36);
  const randomNum = Math.random().toString(36).substr(2, 9);
  return timestamp + randomNum;
}

// 假设你已经有了一个ReadableStream对象叫做readStream

const { Readable, Writable } = require("stream");
const { pipeline } = require("stream");
const { Blob } = require("buffer");

function streamToBlob(readStream, contentType = "application/octet-stream") {
  return new Promise((resolve, reject) => {
    const blobs = [];
    pipeline(
      readStream,
      new Writable({
        write(chunk, encoding, callback) {
          blobs.push(new Blob([chunk], { type: contentType }));
          callback();
        },
      }),
      (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(new Blob(blobs, { type: contentType }));
        }
      }
    );
  });
}

function emptyDirSync(dir) {
  if (!fs.existsSync(dir)) return;

  let files = [];

  // 读取目录中的所有文件/目录
  try {
    files = fs.readdirSync(dir);
  } catch (error) {
    console.error("Error while reading directory:", error);
    return;
  }

  // 遍历并删除所有文件
  files.forEach((file) => {
    const fullPath = path.join(dir, file);

    if (fs.lstatSync(fullPath).isDirectory()) {
      // 如果是目录，则递归删除
      emptyDirSync(fullPath);
    } else {
      // 如果是文件，则直接删除
      fs.unlinkSync(fullPath);
    }
  });
}

function difference(arr1, arr2) {
  return arr1.filter((x) => !arr2.includes(x));
}

function markLikeArray() {
  const arr = Array.from(arguments);
  return arr.map((item) => {
    return Array.isArray(item) ? item : [item];
  });
}

function generateUniqueId() {
  // 创建一个数组来存储已经生成的 ID
  let usedIds = [];
  // 循环直到生成一个不重复的 ID
  while (true) {
    // 生成一个 7 位随机数字字符串 自己根据需要进行改动
    let id = Math.floor(Math.random() * 10000000).toString();

    // 如果 ID 不在已使用的 ID 数组中，就返回它
    if (!usedIds.includes(id)) {
      usedIds.push(id);
      return id;
    }
  }
}

module.exports = {
  traverseFolder,
  generateUniqueId,
  streamToBlob,
  emptyDirSync,
  difference,
  markLikeArray,
  generateUniqueId,
};
