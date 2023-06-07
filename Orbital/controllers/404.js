const userController = require('./user')

exports.get404 = (req, res, next) => {
    res.status(404).render('404', {user: userController.userData});
}
