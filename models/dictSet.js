const mongoose = require("mongoose");
const {DictSchema} = require("./dict");

const DictSetSchema = new mongoose.Schema(
  {
     name: String,
     desc: String,
     options: [DictSchema]
  },
  {
    timestamps: true, // 这将自动添加 createdAt 和 updatedAt 字段
  }
);

DictSetSchema.virtual('formattedCreatedAt').get(function() {
  return this.createdAt.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
});

DictSetSchema.statics.paginate = function(filter = {}, options = {})  {
  const { limit = 10, page = 1 } = options;
  const skip = (page - 1) * limit;
  return this.countDocuments(filter).then(count => {
    // 使用find()、limit()和skip()进行查询
    // 如果用了.lean() 就不能返回虚拟字段
    return this.find(filter)
      .limit(limit)
      .skip(skip)
      .then(results => {
          return {
              results: results.map((item) => {
                  return {
                     ...item.toObject(),
                     formattedCreatedAt: item.formattedCreatedAt
                  } 
              }),
              count,
              page,
              limit
          }
      });
  });
};

module.exports = mongoose.model("dictSet", DictSetSchema);
