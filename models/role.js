const mongoose = require("mongoose");

const RoleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    resource: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "resource",
        }
    ]
  },
  {
    timestamps: true, // 这将自动添加 createdAt 和 updatedAt 字段
  }
);

module.exports = mongoose.model("role", RoleSchema);
