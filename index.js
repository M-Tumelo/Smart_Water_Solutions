let express = require('express');
const fileupload = require('express-fileupload');

let app = express();

let fav = require('serve-favicon');

var moment = require('moment');

const exphbs = require('express-handlebars');

const bodyParser = require('body-parser');
const path = require('path');

//import sqlite modules
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
var cors = require('cors');
app.use(cors());

//Configure the express-handlebars module
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');
const session = require('express-session');
const { compile } = require('handlebars');

//Set-up middleware

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}))

//app.use(fav(path.join(__dirname, 'public', 'img/favicon.ico')))
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
  app.get('', (req, res) => {
    res.render('image');
  });

  // list of querries 
  app.get('/data', (req, res) => {
    const geojson = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [28.2292712, -25.7478676]
          },
          properties: {
            title: 'Mapbox',
            description: 'Home'
          }
        },
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [28.229271, -28.7478676]
          },
          properties: {
            title: 'Mapbox',
            description: 'this Is so Funny'
          }
        },
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [28.229271, -26.7478676]
          },
          properties: {
            title: 'Mapbox',
            description: 'point number 3'
          },
        },
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [29.229271, -26.7478676]
          },
          properties: {
            title: 'Mapbox',
            description: 'point number 4'
          },
        }
      ]
    };
    res.json(geojson);
  })
  app.get('/admin', (req, res) => {

    res.render('querry');
  });

  app.post('', (req, res) => {
    let sampleFile;
    let uploadPath;

    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).send('No files were uploaded.');
    }
    sampleFile = req.files.sampleFile;
    console.log(sampleFile);

    app.post('/login', async (req, res) => {
      req.session.email = req.body.email;
      req.session.psw = req.body.psw;
      let sql = await db.get('Select Email email, Password psw from signup where Email = ?', req.session.email);
      console.log(sql)
      if (sql == null) {
        console.log('Incorrect Email or password');
        res.redirect('/');
      }
      if (sql.psw !== req.session.psw) {
        console.log('Incorrect Email or password')
        res.redirect('/')
      }
      else {
        res.redirect('/')
      }

    });
    app.post('/register', async (req, res) => {
      const { name, email, psw, psw1, user_type } = req.body;

      req.session.name = name;
      req.session.email = email;
      req.session.psw = psw;
      req.session.psw1 = psw1;
      req.session.user_type = user_type;
      let sql = await db.get('Select Email email, Password psw from signup where Email = ?', req.session.email);
      if (sql == null) {
        if (req.session.psw == psw1) {
          const insert_details = 'insert into signup (name, email, password, type_of_user) values (?, ?, ?, ?)';
          await db.run(insert_details, req.session.name, req.session.email, req.session.psw, req.session.user_type);
          res.redirect('/');
        }
        else {
          res.redirect('/')
        }
      }
      else {
        //Write a message to alert the user that the email they using is already in the system
        res.redirect('/')
      }
    });

  });


  let PORT = process.env.PORT || 3001;

  app.listen(PORT, function () {
    console.log('App starting on port', PORT);
  });
});