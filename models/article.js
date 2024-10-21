const mongoose = require("mongoose");

const ArticleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    content: String,
    cover: String,
    desc: String,
    recommend: {
      type: Number,
      default: 0
    },
    cateId: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "categories",
        }
    ],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user'
    },
    like: {
      tId: {
        default: null,
        type: String
      },
      count: {
        default: 0,
        type: Number
      },
      status: {
         default: 0,
         type: Number
      }
    }
  },
  {
    timestamps: true, // 这将自动添加 createdAt 和 updatedAt 字段
  }
);

const formattedCreatedAt = function(createdAt) {
  return createdAt.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
}

const timeAgo = function(createdAt) {
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
}

ArticleSchema.virtual('formattedCreatedAt').get(function() {
  return formattedCreatedAt(this.createdAt);
});

ArticleSchema.virtual('timeAgo').get(function() {
   return timeAgo(this.createdAt);
});

;

ArticleSchema.statics.paginateComments = async function (filter = {}, options = {}) {
  const { limit = 10, page = 1 } = options;
  const skip = (page - 1) * limit;
  const count = await this.countDocuments(filter);
  const results = await this.aggregate([
    {
      $lookup: {
        from: 'comments', // 关联的集合名称
        localField: '_id', // 本地字段，即文章ID
        foreignField: 'articleId', // 外部字段，即评论中的文章ID
        as: 'comments' // 查询结果的输出数组字段名
      }
    },
    {
      $lookup: {
        from: 'users', // 关联的集合名称
        localField: 'user', // 本地字段，即文章ID
        foreignField: '_id', // 外部字段，即评论中的文章ID
        as: 'userLookup'
     }
    },
    {
      $addFields: {
        commentCount: { $size: '$comments' },
        user: { $arrayElemAt: ['$userLookup', 0] },
        // 以下写法暂不生效
        // formattedCreatedAt: '$formattedCreatedAt',
        // timeAgo: '$timeAgo',
      }
    }
  ]).skip(skip)
  .limit(limit);

  return {
    results: results.map((item) => {
      return {
        ...item,
        formattedCreatedAt: formattedCreatedAt(item.createdAt),
        timeAgo: timeAgo(item.createdAt)
     } 
    }),
    totalPages: Math.ceil(count / limit),
    count,
    page,
    limit
  }
};


ArticleSchema.statics.paginate = async function (filter = {}, options = {}) {
  const { limit = 10, page = 1 } = options;
  const skip = (page - 1) * limit;
  const count = await this.countDocuments(filter);
  const entity = await this.find(filter)
    .populate("user")
    .limit(limit)
    .skip(skip);

  return {
    results: entity.map((item) => {
      return {
        ...item.toObject(),
        formattedCreatedAt: item.formattedCreatedAt,
        timeAgo: item.timeAgo
     } 
    }),
    totalPages: Math.ceil(count / limit),
    count,
    page,
    limit,
  };
}

module.exports = mongoose.model("article", ArticleSchema);
