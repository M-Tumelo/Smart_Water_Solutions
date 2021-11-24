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
app.use(express.static('modelAI'));
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
    res.render('login');
  })


  app.get('/login', function (req, res) {
    res.render('login')
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
    const insertData = ('INSERT INTO QUERY (name,longitude,lattitude,query,date,picture,status)  VALUES (?,?,?,?,?,?,?)');
    await db.run(insertData, 'Sense', req.body.long, req.body.lat, req.body.Descript, moment(new Date()).format('MMM D, YYYY'), 'leak.PNG','new');
  });

  app.get('/ad', async (req, res) => {

    const querries = await db.all('select * from query');
    const username = await db.all('select * from signup where email = ?', req.session.email);
    console.log(req.session.techLong, req.session.techLat);
    const mapToken = 'pk.eyJ1IjoicmVnaW9uYWxkIiwiYSI6ImNrdmt0a29sbDBmMmMyb281NjNzaXVqeGUifQ.2ml1Z3_-h8SkvMJR9YDT0Q';

    if (req.session.techLong == undefined && req.session.techLat == undefined) {
       try {
        const geojson = await Promise.all(

          querries.map(async function (column) {
  
            const adressUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${column.longitude},${column.lattitude}.json?access_token=${mapToken}`;
  
  
            //REVERSE GEOLOCATOR API MAPBOX
            const adrress = await fetch(adressUrl);
            const location = await adrress.json();
            const standNo = await location.features[0].address;
            const streetName = await location.features[0].text;
  
            return {
              id: column.id,
              picture: column.picture,
              standNo: standNo,
              streetName: streetName,
              name: column.name,
              longitude: column.longitude,
              lattitude: column.lattitude,
              query: column.query,
              date: column.date,
              status: column.status
            }
          }
  
          ))
        res.render('admin');
       } catch (error) {
         console.log(error);
       }
    }

    else {
      try{
      const geojson = await Promise.all(

        querries.map(async function (column) {
        
          const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${column.longitude},${column.lattitude};${req.session.techLong},${req.session.techLat}?geometries=geojson&access_token=${mapToken}`;
          const adressUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${column.longitude},${column.lattitude}.json?access_token=${mapToken}`;

          //Direction API MAPBOX
          const mapBoxdata = await fetch(url);
          const data = await mapBoxdata.json();
          console.log(data);
          const time = await data.routes[0].duration / 60;
          const distance = await data.routes[0].distance / 1000;

          //REVERSE GEOLOCATOR API MAPBOX
          const adrress = await fetch(adressUrl);
          const location = await adrress.json();
          const standNo = await location.features[0].address;
          const streetName = await location.features[0].text;

          return {
            id: column.id,
            techlong: req.session.techLong,
            techLat: req.session.techLat,
            picture: column.picture,
            standNo: standNo,
            streetName: streetName,
            name: column.name,
            longitude: column.longitude,
            lattitude: column.lattitude,
            query: column.query,
            date: column.date,
            status: column.status,
            time: time.toFixed(2),
            distance: distance.toFixed(2)
          }
        }

        ))
      res.render('admin', { geojson });}
      catch(err){
       console.log(err);
      }
    }
  });

  app.post('/ad', (req, res) => {

    req.session.techLong = req.body.long;
    req.session.techLat = req.body.lat;
    if (req.session.techLat!=undefined){
    res.redirect('/ad');}
  });

  app.get('/ds/:id', async (req, res) => {
    const getQuery = await db.get('select * from query where id = ?', req.params.id);
    // console.log(getQuery);
    res.redirect('/admin')
  })

  app.get('/directions/:id/:message/:userLong/:userLat/:standNo/:streetName/:techLong/:techLat', async (req, res) => {

    req.session.idno = req.params.id;
    const update = 'UPDATE query set status=? where id=?'
    await db.all(update, 'pending', req.session.idno);
    req.session.mapMessage = req.params.message;

    req.session.startLong = req.params.userLong;
    req.session.startLat = req.params.userLat;
    req.session.endLong = req.params.techLong;
    req.session.endLat = req.params.techLat;
    console.log(req.session.startLong,req.session.startLat,req.session.endLong,req.session.endLat)
    req.session.mapsandNo = req.params.standNo;
    req.session.mapstreetName = req.params.streetName;


    const mapToken = 'pk.eyJ1IjoicmVnaW9uYWxkIiwiYSI6ImNrdmt0a29sbDBmMmMyb281NjNzaXVqeGUifQ.2ml1Z3_-h8SkvMJR9YDT0Q';
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${req.session.startLong},${req.session.startLat};${req.session.endLong},${req.session.endLat}?geometries=geojson&access_token=${mapToken}`;
    const query = await fetch(url);
    const json = await query.json();
    const data =await json.routes[0];
    const route = data.geometry.coordinates;
    const directRoad = JSON.stringify(route);

    res.render('directions', {
      idno:req.session.idno,
      message: req.session.mapMessage,
      standNo: req.session.mapsandNo,
      streetName: req.session.mapstreetName,
      startLong: req.session.startLong,
      startLat: req.session.startLat,
      endLong: req.session.endLong,
      endLat: req.session.endLat,
      route: directRoad
    });
  });
  app.get('/complete/:attendedId',async (req,res)=>{

   req.session.attendId=req.params.attendedId;
   const updateAttended = 'UPDATE query set status=? where id=?'
  await db.all(updateAttended,'attended',req.session.attendId);
    res.redirect('/ad');

  });

  app.post("/user", async function (req, response) {
    var images = new Array();

    req.session.query=req.body.string;
    req.session.lattitude = req.body.lattitude;
    req.session.longitude= req.body.longitude;
    
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
          upload = "./upload" + images[i];
          console.log(upload);
          const insertDataUser = ('INSERT INTO QUERY (name,longitude,lattitude,query,date,picture,status)  VALUES (?,?,?,?,?,?,?)');
          await db.run(insertDataUser, 'user',  req.session.longitude, req.session.lattitude,req.session.query, moment(new Date()).format('MMM D, YYYY'),file.name,'new');

          file.mv(upload, function (err) {
            if (err) {
              console.log(err);
            }
          });
        }
      }
    }
    console.log(upload)
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
      if (sql.type_of_user == 'user') res.render('image');
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
        res.redirect('/login');
      }
      else {
        //Passwords do not match
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
