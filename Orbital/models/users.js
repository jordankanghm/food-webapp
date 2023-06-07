const Sequelize = requrie('sequelize');

const sequelize = requrie('../util/database');

const User = sequelize.define('user', {
    user_id: {
        type: Sequelize.INTEGER,
        primaryKey: true
    },
    username: {
        type: Sequelize.STRING,
        allowNull: false
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false
    }
})

module.exports = User;


// const db = require('../util/database');



// module.exports = class User {
//     constructor(user_id, username, email) {
//         this.user_id = user_id;
//         this.username = username;
//         this.email = email;
//     }

//     save() {
//         db.execute('INSERT INTO users (?, ?, ?)',
//         [this.user_id, this.username, this.email]);
//     }

//     static findById(id) {
//         return db.execute('SELECT * FROM users WHERE users.user_id = ?', [id]);
//     }

//     static fetchAll() {

//     }

// }

