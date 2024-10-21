const mongo = require("./db/mongo");
mongo.createConnection();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const handler = require("./handler");
const auth = require("./middleware/auth");
const tourist = require("./middleware/tourist")
const admin = require("./routes/admin");
const user = require("./routes/user");
const deploy = require("./routes/deploy");
const config = require("./routes/config");
const projects = require("./routes/projects");
const business = require("./routes/business");
const content = require("./routes/content");
const root = require("./routes/root");

const path = require("path");
const cookieParser = require('cookie-parser');
const { queryUserInfo } = require("./services/user");
// 使用body-parser中间件解析表单数据
app.use(bodyParser.urlencoded({ extended: false }));
// 设置EJS为模板引擎
app.set('view engine', 'ejs');
// 设置视图文件夹位置
app.set('views', path.join(__dirname, 'views')); 
// 设置静态文件目录/*  */
app.use(express.static('public'))
app.listen(3000, (err) => {
    if (err) {
        console.log("服务启动失败")
    } else {
        console.log("服务已启动")
    }
});
// 使用cookie-parser中间件
app.use(cookieParser());

app.use(handler.setLocalsDefault);

// 使用拦截器/*  */
app.use(tourist.mark, auth.jwtAuth, queryUserInfo);

app.use((req, res, next) => {
    const originalRender = res.render;
    res.render = (view, options, callback) => {
      console.log(`Rendering view: ${view}`);
      originalRender.call(res, view, options, callback);
    };
    next();
});

app.use("/admin", admin);
app.use("/admin/user", user);
app.use("/admin/deploy", deploy);
app.use("/admin/config", config);
app.use("/admin/projects", projects);
app.use("/admin/business", business);
app.use("/admin/content", content);
app.use("/", root);

app.get('*', function(req, res){
    res.render('404', {
        title: 'No Found'
    })
});

// 错误级别的中间件
app.use((err, req, res, next) => {
    if (err.message === 'UnauthorizedError') {
        res.redirect("/admin/user/login/view")
        return 
    }
    res.render("admin/err", {err: err.message, code: 500});
});

process.on('uncaughtException', (error, origin) => { 
    console.error(`Caught exception: ${error}\n` + `Exception origin: ${origin}`); 
}); 


