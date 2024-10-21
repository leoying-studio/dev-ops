const mongoose = require("mongoose");

const CategoriesSchema = new mongoose.Schema(
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

CategoriesSchema.virtual('formattedCreatedAt').get(function() {
  return this.createdAt.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
});

module.exports = mongoose.model("categories", CategoriesSchema);
