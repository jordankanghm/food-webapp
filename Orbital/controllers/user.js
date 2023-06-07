// We should have all the functions for the user login and miscellenous stuff here. 

exports.addUser = (req,res,next) => {
    const user_id = req.body.id;
    const username = req.body.username;
    const email = req.body.email;
    User.create({
        user_id: user_id,
        username: username,
        email: email
    });
}