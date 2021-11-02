let express = require('express');

let app = express();

let fav = require('serve-favicon');

var moment = require('moment'); 

const exphbs = require('express-handlebars');

const pizza_cart = require('./userCart');
const bodyParser = require('body-parser');

//import sqlite modules
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

//Configure the express-handlebars module
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');
const session = require('express-session');
const { compile } = require('handlebars');

//Set-up middleware
app.use(session({ secret: 'keyboard cat', cookie: { maxAge: 300000 } }))
app.use(fav(path.join(__dirname, 'public', 'img/favicon.ico')))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(express.static('public'));

open({
  filename: './data.db',
  driver: sqlite3.Database
}).then(async function (db) {

  // run migrations

  await db.migrate();

  // only setup the routes once the database connection has been established
  app.get('/', (req, res) => {

    res.render('home');
  });


});


let PORT = process.env.PORT || 3001;

app.listen(PORT, function () {
  console.log('App starting on port', PORT);
});
