module.exports = function(passport){
    var bkfd2Password = require("pbkdf2-password");
    var hasher = bkfd2Password();
    var route = require('express').Router();
    var conn = require('../../config/mysql/db')();
    route.get('/logout', function(req,res){
        req.logout();
        req.session.save(function(){
            res.redirect('/welcome');
        });
    });

    route.get('/login', function(req,res){
        res.render('auth/login');
    });


    route.get('/register', function(req,res){
        res.render('auth/register');
    });

    route.post('/register', function(req, res){
        hasher({password:req.body.password}, function(err, pass, salt, hash){
            var user = {
                authId : 'local:' + req.body.username,
                username : req.body.username,
                password : hash,
                salt : salt,
                displayName : req.body.displayName
            };

            var sql = 'insert into users SET ?';
            conn.query(sql, user, function(err, result){
                if (err){
                    console.log(err);
                    res.status(500);
                    return;
                }

                req.login(user, function(err){
                    req.session.save(function(){
                        res.redirect('/welcome');
                    });
                });
            });
        });
    });

    route.post('/login',
        passport.authenticate('local', {
            successRedirect : '/welcome',
            failureRedirect : '/auth/login',
            failureFlash : false
        })
    );

    route.get('/facebook',
        passport.authenticate('facebook',
            {
                scope:'email'
            }
        )
    );

    route.get('/facebook/callback',
        passport.authenticate('facebook', {
            successRedirect: '/welcome',
            failureRedirect: '/auth/login'
        })
    );

    return route;
};