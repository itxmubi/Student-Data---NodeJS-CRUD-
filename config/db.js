const mysql = require('mysql2/promise')

const mySqlpool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'student_db'
})

module.exports = mySqlpool