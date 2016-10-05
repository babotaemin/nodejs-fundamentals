module.exports = function(){
    var mysql = require('mysql');
    var conn = mysql.createConnection({
        host : 'localhost',
        user : 'user',
        password : 'password',
        database : 'databasename'
    });
    conn.connect();

    return conn;
};