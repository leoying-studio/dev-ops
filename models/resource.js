const mongoose = require("mongoose");

const ResourceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    parentId: mongoose.Schema.Types.ObjectId,
  },
  {
    timestamps: true, // 这将自动添加 createdAt 和 updatedAt 字段
  }
);

module.exports = mongoose.model("resource", ResourceSchema);
