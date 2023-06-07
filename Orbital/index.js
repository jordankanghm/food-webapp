const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();

const mainPageRoute = require('./routes/main-page');
const errorController= require('./controllers/404');
const sequelize = require('./util/database');

app.use(bodyParser.urlencoded({extended : false}));
app.use(express.static(path.join(__dirname, 'views')));

app.set('view engine', 'ejs');


app.use(mainPageRoute.routes);

app.use(errorController.get404);

// sequelize.sync().then(result =>{

// }).catch();


app.listen(4000, () => {
    console.log("LISTENING ON PORT 4000")
});