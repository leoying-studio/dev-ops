const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema(
  {
    articleId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    replyId: mongoose.Schema.Types.ObjectId,
    enterName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    }
  },
  {
    timestamps: true, // 这将自动添加 createdAt 和 updatedAt 字段
  }
);

CommentSchema.virtual('formattedCreatedAt').get(function() {
    return this.createdAt.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
});
  
module.exports = mongoose.model("comment", CommentSchema);
