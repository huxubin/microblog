/**
 * 文件说明: 路由
 * 详细描述:
 * 创建者: huxb
 * 创建时间: 2017/08/28
 * 变更记录:
 */
var express = require('express');
var router = express.Router();
var crypto = require('crypto');

var User = require('../models/user.js');
var Post = require('../models/post.js');

/* GET home page. */
router.get('/',function(req,res) {
  Post.get(null,function(err, posts){
      if(err){
          posts = [];
      }
      res.render('index', {
          title:'首页',
          user: req.session.user,
          success:req.session.success,
          error:req.session.error,
          posts:posts
      });
  });
});

router.get('/u/:user', function(req, res, next) {
	User.get(req.params.user,function(err, user){
		if(!user){
			req.flash('error','用户不存在');
			return res.redirect('/');
		}
		Post.get(user.name,function(err, posts) {
			if (err) {
				req.flash('error', err);
				return res.redirect('/');
			}
			console.log(err,'err');
			console.log(posts,'posts');
			res.render('user', {
				title: user.name,
				posts:posts,
                user: req.session.user,
                success:req.session.success,
                error:req.session.error
			});
		});
	});
});

router.get('/reg', checkNotLogin);
router.get('/reg', function(req, res, next) {
    res.render('reg',{
        title:'注册',
        user: req.session.user,
        success:req.session.success,
        error:req.session.error
    });
});

// 注册
router.post('/reg', checkNotLogin);
router.post('/reg', function(req, res){
    //检验用户两次输入的口令是否一致
    if(req.body['password-repeat'] != req.body['password']){
        req.flash('error','两次输入的口令不一致');
        return res.redirect('/reg');
    }

    // 生成口令的散列值
    var md5 = crypto.createHash('md5');
    var password = md5.update(req.body.password).digest('base64');
    var newUser = new User({
        name: req.body.username,
        password: password
    });

    //检查用户名是否已经存在
    User.get(newUser.name, function(err,user) {

        //req.flash是Express提供的一个奇妙的工具,它保存的变量只会在用户当前和下一次的请求中被访问,之后会被清除,可以很方便地实现页面的通知和错误信息显示功能
        if(user){
            err = 'Username already exists.';
        }

        if(err){
            req.flash('error', err);
            return res.redirect('/reg');
        }
        // 如果不存在则新增用户
        newUser.save(function(err) {
            if(err){
                req.flash('error', err);
                return res.redirect('/reg');
            }
            req.session.user = newUser;
            req.flash('success','注册成功');
            res.redirect('/');
        });
    });
});

// 登录
router.get('/login',checkNotLogin);
router.get('/login', function(req, res,next) {
	res.render('login', {
		title: '用户登入',
		user: req.session.user,
		success:req.session.success,
		error:req.session.error
	});
});

router.post('/login',checkNotLogin);
router.post('/login',function(req,res,next){
    // 生成口令的散列值
	var md5 = crypto.createHash('md5');
	var password = md5.update(req.body.password).digest('base64');
	User.get(req.body.username, function(err, user) {
		if(!user){
			req.flash('error', '用户不存在');
			return res.redirect('/login');
		}
		if (user.password != password) {
			req.flash('error', '用户口令错误');
			return res.redirect('/login');
		}
		req.session.user = user;
		req.flash('success', '登入成功');
		res.redirect('/');
	});
});


// 退出
router.get('/logout', checkLogin);
router.get('/logout', function(req,res,next) {
	req.session.user = null;
	req.flash('success', '登出成功');
	res.redirect('/');
});

router.post('/post', checkLogin);
router.post('/post', function(req, res) {
	var currentUser = req.session.user;
	var post = new Post(currentUser.name, req.body.post);
	post.save(function(err) {
		if (err) {
			req.flash('error', err);
			return res.redirect('/');
		}
		req.flash('success', '发表成功');
		res.redirect('/u/' + currentUser.name);
	});
});

//检查是否登录
function checkLogin(req,res,next) {
	if(!req.session.user){
        return res.redirect('/login');
	}
	next();
}

function checkNotLogin(req,res,next){
    if(req.session.user){
        return res.redirect('/');
    }
    next();
}

module.exports = router;
