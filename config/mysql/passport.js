module.exports = function(app){
    var conn = require('./db')();
    var passport = require('passport');
    var LocalStrategy = require('passport-local').Strategy;
    var FacebookStrategy = require('passport-facebook').Strategy;
    var bkfd2Password = require("pbkdf2-password");
    var hasher = bkfd2Password();

    app.use(passport.initialize());
    app.use(passport.session());


    passport.serializeUser(function(user, done) {
        console.log('serializeUser', user);
        done(null, user.authId);
    });

    passport.deserializeUser(function(id, done) {
        console.log('deserializeUser', id);

        var sql = 'SELECT * FROM users WHERE authId = ?';
        conn.query(sql, [id], function (err, result){
            if (err){
                return done('There is no user');
            }

            done(null, result[0]);
        });
    });

    passport.use(new LocalStrategy(
        function(username, password, done){
            var uname = username;
            var pwd = password;

            var sql = 'SELECT * FROM users WHERE authId = ?';

            conn.query(sql, ['local:' + uname], function(err, result){

                if (err){
                    return done('There is no user');
                }

                var user = result[0];
                return hasher({password:pwd, salt:user.salt}, function(err, pass, salt, hash){
                    if (hash === user.password){
                        done(null, user);
                    }
                    else {
                        done(null, false);
                    }
                });
            });
        }
    ));

    passport.use(new FacebookStrategy({
            clientID: '951533421635713',
            clientSecret: '4494aaebca7385ea789d0f5a823dadbe',
            callbackURL: "/auth/facebook/callback",
            profileFields:['id', 'email', 'gender', 'link', 'locale',
                'name', 'timezone', 'updated_time', 'verified', 'displayName']
        },
        function(accessToken, refreshToken, profile, done) {
            var authId = 'facebook:' + profile.id;

            var sql = 'SELECT * FROM users WHERE authId = ?';

            conn.query(sql, [authId], function(err, result){
                if (err) {
                    console.log(err);
                    done('There is no user');
                }

                if (result.length > 0){
                    done(null, result[0]);
                } else {
                    var sql = 'INSERT INTO users SET ?';

                    var newUser = {
                        authId : authId,
                        displayName : profile.displayName,
                        email : profile.emails[0].value
                    };

                    conn.query(sql, [newUser], function(err, result){
                        if (err) {
                            console.log(err);
                            return done('Insert Error');
                        }

                        done(null, newUser);
                    })
                }
            });
        }
    ));

    return passport;
}