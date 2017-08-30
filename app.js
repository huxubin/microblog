var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var session = require('express-session');
var MongoStore = require('connect-mongo')(session);

var flash = require('connect-flash');

var settings = require('./settings');

// 路由都存放于index文件
var index = require('./routes/index');

var app = express();

// 日志
var fs = require('fs');
var accessLogfile = fs.createWriteStream('access.log', {flags: 'a'});
var errorLogfile = fs.createWriteStream('error.log', {flags: 'a'});

if(app.get('env') === 'development'){ //production
    app.use(logger({stream: accessLogfile}));
    app.use(function(err,req,res,next){
        var meta = '[' + new Date() + '] ' + req.url + '\n';
        errorLogfile.write(meta + err.stack + '\n');
        next();
    });
}


var expressLayouts = require('express-ejs-layouts');
app.use(expressLayouts);

// 设置页面模板位置和模板引擎
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// 静态资源路径
app.use(express.static(path.join(__dirname, 'public')));

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// session现在与express剥离开了,express.static是express 4.x唯一的内置中间件
app.use(session({
    secret: settings.cookieSecret,
    store: new MongoStore({
        url:'mongodb://localhost:27017'
    })
}));
app.use(flash());

app.use('/', index);

app.use(function(req,res,next){
    res.locals.user=req.session.user;

    var err = req.flash('error');
    var success = req.flash('success');

    res.locals.error = err.length ? err : null;
    res.locals.success = success.length ? success : null;

    next();
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  //res.render('error');
});

module.exports = app;
