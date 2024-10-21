const mongoose = require("mongoose");

const DeploySchema = new mongoose.Schema(
  {
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    desc: {
        type: String
    }
  },
  {
    toObject: {
      virtuals: true
    },
    toJSON: {
      virtuals: true
    },
    timestamps: {
      // currentTime: () => Math.floor(Date.now() / 1000) // 使用Unix时间戳格式
    }
  }
);

DeploySchema.virtual('formattedCreatedAt').get(function() {
  return this.createdAt.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
});

DeploySchema.virtual('timeAgo').get(function() {
  const createdAt = this.createdAt;
  const currentDate = new Date();
  const timeDiff = Math.abs(currentDate.getTime() - createdAt.getTime());
  const diffDays = Math.floor(timeDiff / (1000 * 3600 * 24));
  if (timeDiff <  (1000 * 60 * 1)) {
    return "刚刚";
  }
  if (timeDiff <  (1000 * 60 * 15)) {
    return Math.floor(timeDiff / (1000 * 60)) + "分钟前";
  }
  if (diffDays === 0) {
    return '今天';
  } else if (diffDays < 7) {
    return `${diffDays}天前`;
  } else {
    return this.createdAt.toLocaleDateString();
  }
});

DeploySchema.statics.paginate = function(filter = {}, options = {})  {
    const { limit = 10, page = 1 } = options;
    const skip = (page - 1) * limit;
    return this.countDocuments(filter).then(count => {
      // 使用find()、limit()和skip()进行查询
      // 如果用了.lean() 就不能返回虚拟字段
      return this.find(filter)
        .populate("user")
        .limit(limit)
        .skip(skip)
        .sort({ createdAt: -1 })
        .then(results => {
            return {
                results: results.map((item) => {
                    return item.toObject();
                }),
                count,
                page,
                limit
            }
        });
    });
};

module.exports = mongoose.model("deploy", DeploySchema);
