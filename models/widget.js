const mongoose = require("mongoose");

const TypeEnumValue = {
   1: 'input',
   2: 'checkbox',
   3: 'radio',
   4: 'textarea',
   5: 'select',
   6: 'img',
   7: 'date'
};

// <% if(item.type == 1) {%>
//    <input name="<%= item.value %>" class="form-control"/>
// <% } %>

// <% if(item.type == 2) {%>
//    <div>
//        <% options.forEach(function(option, index) { %>
//            <span><%= option && option.key %></span>
//            <input type="checkbox" name="<%= option && option.value %>" class="form-control"/>
//        <% }) %>
//    </div>
// <% } %>

// <% if(item.type == 3) {%>
//    <input type="radio" name="<%= item.value %>" class="form-control"/>
// <% } %>

// <% if(item.type == 4) {%>
//    <textarea name="<%= item.value %>" class="form-control"/>
// <% } %>

// <% if(item.type == 5) {%>
//    <textarea name="<%= item.value %>" class="form-control"/>
// <% } %>

const WidgetSchema = new mongoose.Schema(
  {
     label: String,
     value: String,
     type: {
        type: Number,
        enum: [...Object.keys(TypeEnumValue)]
     },
     dictSet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'dictSet',
        populate: true
     }
  },
  {
    timestamps: true, // 这将自动添加 createdAt 和 updatedAt 字段
  }
);

WidgetSchema.virtual('name').get(function() {
   // 这里可以根据需要填充子文档，例如从其他数据源或通过计算得到
   // 这里的示例是简单地返回子文档列表
   return TypeEnumValue[this.type];
});

module.exports = WidgetSchema
