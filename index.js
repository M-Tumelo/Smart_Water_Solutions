const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();
let fav = require('serve-favicon');
var moment = require('moment');
const exphbs = require('express-handlebars');
const session = require('express-session');
const { compile } = require('handlebars');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
var cors = require('cors');
const fetch = require('node-fetch');
const { Promise } = require('node-fetch');

let PORT = process.env.PORT || 3001;

//Configure the express-handlebars module
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');
app.use(cors());

//Set-up middleware

app.use(session({ secret: 'keyboard cat', resave: false, saveUninitialized: true }))

//app.use(fav(path.join(__dirname, 'public', 'img/favicon.ico')))
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(express.static('public'));
app.use(express.static('upload'));
app.use(fileUpload());

open({
  filename: './data.db',
  driver: sqlite3.Database
}).then(async function (db) {

  // run migration

  await db.migrate();

  const queryQ = await db.all('select * from query');
  var upload;
  app.get('/', (req, res) => {
    res.render('home');
  });

  app.get('/user', async (req, res) => {
    const username = await db.all('select * from signup where email = ?', req.session.email);
    res.render('image', {
      queryQ,
      username
    });
  });

  app.get('/register', (req, res) => {
    res.render('home');
  })


  app.post('/count', function (req, res) {
    counter++;
    res.redirect('/user')
  });

  app.post('/johnquery', async function (req, res) {

    // read more about destructoring here - https://exploringjs.com/impatient-js/ch_destructuring.html
    const { Query } = req.body;

    if (!Query) {
      // nothing is added
      console.log("Test")
      return res.redirect('/user');
    }
    else {
      const insertQuerriesSQL = 'insert into query (name, query, date, picture, status) values (?, ?, ?, ?, ?)';
      await db.run(insertQuerriesSQL, "res.session.name", Query, moment(new Date()).format('MMM D, YYYY'), upload, 'new');
      // console.log(Query)
      res.redirect('/user')
    }

  });


  app.post('/remove/:id', async function (req, res) {

    const bookId = req.params.id;
    const deleteQuerriesSQL = 'delete from notifications where id = ?';
    await db.run(deleteQuerriesSQL, bookId);
    res.redirect('/user');

  });

  app.get('/data', async (req, res) => {

    const querries = 'SELECT * from QUERiES';
    const geos = await db.all(querries);
    res.json(geos);
  });

  app.get('/admin', async (req, res) => {
    const username = await db.all('select * from signup where email = ?', req.session.email);
    res.render('querry', { queryQ, username });
  });

  app.get('/sense', (req, res) => {

    res.render('sense');
  });

  app.post('/sense', async (req, res) => {
    const insertData = ('INSERT INTO QUERY (name,longitude,lattitude,query,date,picture)  VALUES (?,?,?,?,?,?)');
    await db.run(insertData, 'Sense', req.body.long, req.body.lat, req.body.Descript, moment(new Date()).format('MMM D, YYYY'), 'leak.PNG');
  });

  app.get('/ad', async (req, res) => {

    const querries = await db.all('select * from query');
    const username = await db.all('select * from signup where email = ?', req.session.email);
    console.log(req.session.techLong, req.session.techLat);

    const mapToken = 'pk.eyJ1IjoicmVnaW9uYWxkIiwiYSI6ImNrdmt0a29sbDBmMmMyb281NjNzaXVqeGUifQ.2ml1Z3_-h8SkvMJR9YDT0Q';
    
    const geojson=await Promise.all (

     querries.map(async function (colunmn) {

      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/28.02214,-26.20153;28.04396,-26.20497?geometries=geojson&access_token=${mapToken}`;
      const adressUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/28.04396,-26.20497.json?access_token=${mapToken}`;
 
      //Direction API MAPBOX
      const mapBoxdata = await fetch(url);
      const data = await mapBoxdata.json();
      const time = await data.routes[0].duration;
      const distance =await data.routes[0].distance;

      //REVERSE GEOLOCATOR API MAPBOX
      const adrress = await fetch(adressUrl);
      const location = await adrress.json();
      const standNo =await location.features[0].address;
      const streetName =await location.features[0].text;

      
      // console.log(time, distance);

      return {
        id: colunmn.id,
        time: time,
        distance:distance,
        picture:colunmn.picture,
        standNo:standNo,
        streetName:streetName
      }
    }

    ))

    console.log(geojson)
    res.render('admin', { querries });
  });

  app.post('/ad', (req, res) => {

    req.session.techLong = req.body.long;
    req.session.techLat = req.body.lat;
    res.redirect('/ad');
  })

  app.get('/ds/:id', async (req, res) => {
    const getQuery = await db.get('select * from query where id = ?', req.params.id);
    // console.log(getQuery);
    res.redirect('/admin')
  })

  app.post("/user", async function (req, response) {
    var images = new Array();
    if (req.files) {
      var arr;
      if (Array.isArray(req.files.filesfld)) {
        arr = req.files.filesfld;
      }
      else {
        arr = new Array(1);
        arr[0] = req.files.filesfld;
      }
      for (var i = 0; i < arr.length; i++) {
        var file = arr[i];
        if (file.mimetype.substring(0, 5).toLowerCase() == "image") {
          images[i] = "/" + file.name;
          upload = "./upload" + images[i]
          // await db.run('insert into query (picture) values (?)', upload)
          file.mv(upload, function (err) {
            if (err) {
              console.log(err);
            }
          });
        }
      }
    }
    // give the server a second to write the files
    setTimeout(function () { response.json(images); }, 1000);
  });

  app.post('/login', async (req, res) => {
    req.session.email = req.body.email;
    req.session.psw = req.body.psw;
    let sql = await db.get('Select * from signup where Email = ?', req.session.email);
    // console.log(sql)
    if (sql == null) {
      console.log('Incorrect Email or password');
      res.redirect('/');
    }
    if (sql.password !== req.session.psw) {
      console.log('Incorrect or password')
      res.redirect('/')
    }
    else {
      // console.log('siright')
      if (sql.type_of_user == 'user') res.redirect('/user');
      else res.redirect('/ad');
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
// });
