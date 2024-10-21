const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
    },
    nickName: {
      type: String,
    },
    password: {
      type: String,
    },
    passwordAgain: {
      type: String,
    },
    roles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "role",
      },
    ],
  },
  {
    timestamps: true, // 这将自动添加 createdAt 和 updatedAt 字段
  }
);

module.exports = mongoose.model("user", UserSchema);
