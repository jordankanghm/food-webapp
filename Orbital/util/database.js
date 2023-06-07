// const mysql = require('mysql2');

// const pool = mysql.createPool({
//     host:'localhost',
//     user:'root',
//     database:'orbital-database',
//     password:'Dawson141092',
// });

// module.exports = pool.promise();

const Sequelize = require('sequelize');

const sequelize = new Sequelize('orbital-database', 'root', 'Dawson141092', {
    dialect: 'mysql'
});

module.exports = sequelize;



