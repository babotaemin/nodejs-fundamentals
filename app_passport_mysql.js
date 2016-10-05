var app = require('./config/mysql/express')();
var passport = require('./config/mysql/passport')(app);
var auth = require('./routes/mysql/auth')(passport);

app.use('/auth', auth);
app.get('/', function(req,res){
    res.redirect('/welcome');
})

app.listen(3003, function(){
    console.log('Connected 3003 port!!');
});

app.get('/welcome', function(req, res){
    if (req.user && req.user.displayName)
    {
        res.render('auth/welcome', {displayName : req.user.displayName});
    }
    else
    {
        res.render('auth/welcome', {displayName : undefined});
    }
});

