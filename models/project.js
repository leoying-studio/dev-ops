const mongoose = require("mongoose");
const WidgetSchema = require("./widget");
//  1 是关， 0是开
const ProjectSchema = new mongoose.Schema(
  {
    name: String,
    isOpen: Number,
    form: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "form",
    },
    formFieldsValue: {
      type: Object,
      default: null,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    logo: String,
    desc: String,
  },
  {
    timestamps: true, // 这将自动添加 createdAt 和 updatedAt 字段
  }
);

ProjectSchema.virtual("formattedCreatedAt").get(function () {
  return this.createdAt.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
});

ProjectSchema.statics.paginate = async function (filter = {}, options = {}) {
  const { limit = 10, page = 1 } = options;
  const skip = (page - 1) * limit;
  const count = await this.countDocuments(filter);
  const entity = await this.find(filter)
    .populate("user form")
    .limit(limit)
    .skip(skip);

  return {
    results: entity.map((item) => {
      return {
        ...item.toObject(),
        formattedCreatedAt: item.formattedCreatedAt
     } 
    }),
    count,
    page,
    limit,
  };
};

// ProjectSchema.statics.paginate = function (filter = {}, options = {}) {
  // const { limit = 10, page = 1 } = options;
  // const skip = (page - 1) * limit;
  // return this.countDocuments(filter).then((count) => {
  //   return this.aggregate([
  //     {
  //       $lookup: {
  //         from: "forms",
  //         localField: "form",
  //         foreignField: "_id",
  //         as: "formInfo",
  //       },
  //     },
  //     {
  //       $lookup: {
  //         from: "users",
  //         localField: "user",
  //         foreignField: "_id",
  //         as: "userInfo",
  //       },
  //     },
  //     {
  //       $unwind: "$formInfo",
  //     },
  //     {
  //       $unwind: "$formInfo.widgets",
  //     },
  //     {
  //       $lookup: {
  //         from: "dictsets",
  //         let: { dictsetId: "$formInfo.widgets[0].dictSet" },
  //         pipeline: [
  //           {
  //             $match: {
  //               $expr: { $eq: ["$_id", "$$dictsetId"] },
  //             },
  //           },
  //         ],
  //         as: "dictSet",
  //       },
  //     },
  //     // {
  //     //   $addFields: {
  //     //     "formInfo.widgets.dictInfo": "$dictSet",
  //     //     creator: { $arrayElemAt: ["$userInfo", 0] /*  */}, // 获取第一个元素
  //     //     formattedCreatedAt/*  */: {
  //     //       $dateToString: { format: "%Y年%m月%d日", date: "$createdAt" }
  //     //     }
  //     //   },
  //     // },
  //   ])
  //     .limit(limit)
  //     .skip(skip)
  //     .sort({ createdAt: -1 })
  //     .then((results) => {
  //       return {
  //         results,
  //         count,
  //         page,
  //         limit,
  //       };
  //     });
  // });
// };

module.exports = mongoose.model("project", ProjectSchema);
