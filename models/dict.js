const mongoose = require("mongoose");

const DictSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true
    },
    value: {
       type: Number,
       required: true
    },
    name: {
      type: String,
    }
  },
  {
    timestamps: true, // 这将自动添加 createdAt 和 updatedAt 字段
  }
);

module.exports.DictSchema = DictSchema;
