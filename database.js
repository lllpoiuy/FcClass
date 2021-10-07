
const mysql = require("mysql")
const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "Huang3110@ak",
    database: "fcclass"
})
connection.connect((err) => {
    if (err) { console.log("连接 mysql 失败") }
    else { console.log("连接 mysql 成功") }
})
 
query= async function(sql, callback) {
    connection.query(sql, function (err, dat) {
        callback(err, dat);
    });
}

modify= async function(id, item, delta, cause, type, term) {
    // console.log("update students set " + item + "=" + item + "+" + delta + " where id=" + id);
    // console.log("insert his_edit value(0, " + cause + ", " + item + ", " + delta + ", " + term + ", " + id + ", " + type + ")");
    connection.query("update students set " + item + "=" + item + "+" + delta + " where id=" + id);
    connection.query("insert his_edit value(0, \"" + cause + "\", \"" + item + "\", " + delta + ", " + term + ", " + id + ", \"" + type + "\")");
}

exports.query = query;
exports.modify = modify;
