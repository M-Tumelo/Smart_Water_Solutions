let express = require('express');
const fileUpload = require('express-fileupload');

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
let PORT = process.env.PORT || 3001;

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
  app.get('/user', (req, res) => {
    res.render('image');
  });


  app.get('/', (req, res) => {
    res.render('home');
  });

  app.get('/register', (req, res) => {
    res.render('home');
  });

  app.get('/login', (req, res) => {
    res.render('home');
  });

  // list of querries 
  app.get('/data', async (req, res) => {

    const querries = 'SELECT * from QUERiES';
    const geos = await db.all(querries);

    const geoJson = geos.map(function (store) {
      return {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [store.long, store.lat]
        },
        properties: {
          title: 'Mapbox',
          description: store.discript
        }
      }
    });
    res.json(geoJson);
  });

  app.get('/admin', (req, res) => {

    res.render('technician');
  });

  app.get('/sense', (req, res) => {

    res.render('sense');
  });

  app.post('/sense',async (req, res) => {
    console.log(req.body.discript);
    const insertData = ('INSERT INTO QUERiES (long,lat,discript)  VALUES (?,?,?)');
    await db.run(insertData, req.body.long, req.body.lat, req.body.Descript);
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
  app.listen(PORT, function () {
    console.log('App starting on port', PORT);
  });
})