
const express = require('express');
const app = express();
app.listen(8000);
app.set('view engine', 'ejs');
// express and ejs

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// body_parser

var cookieParser = require('cookie-parser');
app.use(cookieParser("HxSD_dsAsIcoiIO_CA"));
// cookie_parser

var session = require("express-session");
app.use(session({
    secret: '12345',
    name: 'fcclass',
    cookie: { maxAge: 3600000 * 24 * 7 },
    resave: false, 
    saveUninitialized: true,
    rolling : true
}));
// setup session

let db = require('./database');
// connect with mysql

let calculator = require('./calculate');
// to calculate the final score

var errorType;
// the value post to the error page

app.use('/static', express.static('static'));
let exporter = require('./export');
// setup file downloads

const nowTerm = 1;

app.use((req, res, next)=> {
    if (req.session.yes != true && req.url != '/login' && req.url != '/error' && req.url != '/doLogin') {
        res.redirect('/login');
    }
    else {
        next();
    }
})
// check if it login

app.get('/', (req, res)=> {
    res.render('index', {
        nowpos : "",
        username : req.session.username
    });
})
// home page ?

app.get('/login', (req, res)=> {
    res.render('login');
})
// login page

app.post('/doLogin', (req, res)=> {
    if (req.session.yes) {
        errorType = "您已经登录";
        res.redirect('/error');
        return;
    }
    db.query("SELECT passwd, is_admin FROM user where `username`=\"" + req.body.username + "\"", (err, dat)=> {
        if (err) console.log(err);
        if (!err && dat[0].passwd == req.body.password) {
            console.log(req.body.username + " login successfully.");
            req.session.username = req.body.username;
            req.session.yes = true;
            req.session.is_admin = dat[0].is_admin;
            res.send({
                success: true,
                result: {
                    url: '/'
                }
            });
        }
        else {
            res.send({
                seccess : false,
                message : "密码错误",
                result : {
                    url : 'login'
                }
            })
        }
    })
})
// login api

app.post('/doLogout', (req, res)=> {
    if (!req.session.yes) {
        errorType = "您没有登录";
        res.redirect('/error');
    }
    else {
        req.session.username = null;
        req.session.yes = false;
        req.session.is_admin = false;
        res.redirect('/login');
    }
})
// logout api

app.get('/list/:by', (req, res)=> {
    var by = req.params['by'];
    db.query("select id, rname, sex, learning, contribution, performance from students", (err, dat)=> {
        if (err) {
            errorType = err;
            res.redirect('/error');
        }
        else {
            res.render('list', {
                nowpos : "list",
                sortBy : by,
                username : req.session.username,
                table : calculator.calc(dat, by)
            })
        }
    })
})
// list page

app.get('/history', (req, res)=> {
    res.render('history', {
        nowpos : "history", 
        sortBy : null,
        username : req.session.username,
        table : { length : 0 }
    })
})

app.get('/history/:id/:term', (req, res)=> {
    var id = req.params['id'];
    var term = req.params['term'];
    // console.log("select id, cause, delta, item from his_edit where id = " + id + "and term = " + term);
    db.query("select user, term, cause, delta, item, type from his_edit where user=" + id + " and term=" + term, (err, dat)=> {
        if (err) {
            errorType = err;
            res.redirect('/error');
        }
        else {
            res.render('history', {
                nowpos : "history",
                username : req.session.username,
                table : dat
            })
        }
    })
})

app.get('/history/:id/:term/:item', (req, res)=> {
    var id = req.params['id'];
    var term = req.params['term'];
    var item = req.params['item'];
    db.query("select user, term, cause, delta, item, type from his_edit where user=" + id + " and term=" + term + " and item=" + item, (err, dat)=> {
        if (err) {
            errorType = err;
            res.redirect('/error');
        }
        else {
            res.render('history', {
                nowpos : "history",
                username : req.session.username,
                table : dat
            })
        }
    })
})

app.post('/edit', (req, res)=> {
    // console.log(req.body);
    if (!req.session.is_admin) {
        res.send({
            success : false,
            message : "权限不足"
        })
        return;
    }
    db.modify(req.body.id, req.body.item, req.body.delta, req.body.cause, req.body.type, nowTerm);
    res.send({
        success : true,
        message : "操作成功",
        url : req.body.page
    })
})
// edit api

app.get('/minus', (req, res)=> {
    res.render('minus', {
        nowpos : "minus",
        nowTerm : nowTerm
    });
})

app.get('/else', (req, res)=> {
    res.render('else', {
        nowpos : "else",
        nowTerm : nowTerm
    });
})

app.get('/print', (req, res)=> {
    var by = req.params['by'];
    db.query("select id, rname, sex, learning, contribution, performance from students", (err, dat)=> {
        if (err) {
            errorType = err;
            res.redirect('/error');
        }
        else {
            exporter.export(calculator.calc(dat, "id"));
            res.redirect('/static/list.xlsx');
        }
    })
})

app.get('/compete', (req, res)=> {
    res.render('compete', {
        nowpos : "compete",
        nowTerm : nowTerm
    });
})

app.get('/contest', (req, res)=> {
    res.render('contest', {
        nowpos : "contest",
        nowTerm : nowTerm
    });
})

app.get('/epswd', (req, res)=> {
    res.render('epswd');
})

app.post('/newpass', (req, res)=> {
    if (!req.session.yes) {
        errorType = "您还未登录";
        res.redirect('/error');
        return;
    }
    db.query("SELECT passwd FROM user where `username`=\"" + req.session.username + "\"", (err, dat)=> {
        if (err) console.log(err);
        if (!err && dat[0].passwd == req.body.oldps) {
            console.log(req.session.username + "change passwd successfully.");
            db.query("UPDATE user SET passwd = \"" + req.body.newps + "\" where `username`=\"" + req.session.username + "\"", (err, dat)=>{});
            res.send({
                success: true,
                result: {
                    url: '/'
                }
            });
        }
        else {
            errorType = "密码错误，请重新输入";
            res.redirect('/error');
        }
    })
})

app.get('/error', (req, res)=> {
    if (errorType == null) {
        res.render('error', {
            cause : "404"
        })
    }
    else {
        res.render('error', {
            cause : errorType
        })
        errorType = null;
    }
})
// error page

