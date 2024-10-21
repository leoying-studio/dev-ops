// nodejs 通过shell 命令来启动mongod
const command = require("./../tools/command");
const mongoose = require("mongoose");
const db = mongoose.connection;
const dbConfig = require("./../config/db.json");
// 连接成功
db.on("open", function () {
  console.log("数据库连接成功");
});
// 连接失败
db.on("error", function (err) {
  console.log("数据库连接失败 原因：" + err);
});
// 连接断开
db.on("close", function () {
  console.log("连接断开");
});

// const startMongo = async () => {
//   process.chdir("D:\\privateworks\\mongo\\3.0.6\\bin");
//   const currentDirectory = process.cwd();
//   console.log("当前运行目录:", currentDirectory);
//   return command.exec([
//     "mongod --config D:/privateworks/mongo/3.0.6/config/test_01.conf", "mongo"
//   ]);
// };

const createConnection = async () => {
  try {
    await mongoose.connect(dbConfig.connURL, {
      dbName: dbConfig.dbName,
      autoCreate: true,
      bufferCommands: true
    });
  } catch (e) {
    console.log("mongo 连接失败", e);
  }
}; 

module.exports.createConnection = createConnection;
