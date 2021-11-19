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
let PORT = process.env.PORT || 30021;

//Configure the express-handlebars module
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

const session = require('express-session');
const { compile } = require('handlebars');
const { query } = require('express');

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
app.use(fileupload());

app.use(express.static('modelAI'))


open({
  filename: './data.db',
  driver: sqlite3.Database
}).then(async function (db) {

  // run migration

  await db.migrate();

  // only setup the routes once the database connection has been established
app.get('/',  (req, res) => {
  res.render('home');
});

app.get('/user',async (req, res) => {
  const queryQ = await db.all('select * from query');
  const username = await db.all('select * from signup where email = ?', req.session.email);
  console.log(username)
    res.render('image', {
      queryQ,
      username
    });
});

app.get('/register', (req, res)=>{
  res.render('home');
})


app.post('/count', function (req, res) {
  counter++;
  res.redirect('/user')
});

app.get('/al', (req, res)=>{
  res.render('al');
})


app.post('/al', function (req, res) {
 // counter++;
  res.redirect('/al')
});



app.post('/johnquery', async function (req, res) {

  // read more about destructoring here - https://exploringjs.com/impatient-js/ch_destructuring.html
  const { Query } = req.body;

  if (!Query) {
    // nothing is added
    return res.redirect('/user');
  }

  const insertQuerriesSQL = 'insert into query (query, date) values (?, ?)';
  await db.run(insertQuerriesSQL, Query, moment(new Date()).format('MMM D, YYYY'));
  const queryQ = await db.all('select * from query');
//console.log(queryQ)
  res.redirect('/user')
});

app.post('/uQuerry', async (req,res) => {
  const { Query } = req.body;

  if (!Query) {
    // nothing is added
    return res.redirect('/user');
  }
  console.log(req.body.discript);
  const insertData = ('INSERT INTO QUERiES (long,lat,discript,image)  VALUES (?,?,?)');
  await db.run(insertData, req.body.long, req.body.lat, req.body.descript, req.body.image);

  // const insertQuerriesSQL = 'insert into query (query, date) values (?, ?)';
  // await db.run(insertQuerriesSQL, Query, moment(new Date()).format('MMM D, YYYY'));
  // const queryQ = await db.all('select * from query');;
 //res.redirect('/user')
}); 
  app.get('/uQuerry', async (req, res) => {

  const queryQ = await db.all('select * from QUERiES');
 res.render('user', {queryQ})
  });

// app.get('/reminder/:dayCount/days', function (req, res) {

//   // find me all the reminders for the current Day count
//   const filteredReminders = reminders.filter(function (reminder) {
//     return reminder.dayCount == Number(req.params.dayCount)
//   })

//   res.render('reminder', {
//     reminders: filteredReminders
//   });

// });

app.post('/remove/:id', async function(req, res){

  const bookId = req.params.id;
  const deleteQuerriesSQL = 'delete from notifications where id = ?';
  await db.run(deleteQuerriesSQL, bookId);
  res.redirect('/user');
  
});

// app.get('/edit/:id', function (req, res) {
//   res.render("edit");
// });



// only setup the routes once the database connection has been established

// })




// we use global state to store data

// const reminders = [];

app.post('/api', (request, response) => {
  console.log(request.body);
  const data =  request.body;
  response.json({
    status: 'Success',
    latitude : data.lat,
    longitude: data.lon
  });
})


  // list of querries 
  app.get('/data', (req, res) => {
    const geojson = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [28.044088, -26.205246]
          },
          properties: {
            title: 'Mapbox',
            description: 'picture'
          }
        },
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [28.049271, -26.2078676]
          },
          properties: {
            title: 'Mapbox',
            description: 'picture'
          }
        },
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [28.0428271, -26.2378676]
          },
          properties: {
            title: 'Mapbox',
            description: 'picture'
          },
        },
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [28.0223241, -26.200886]
          },
          properties: {
            title: 'Mapbox',
            description: 'picture'
          },
        }
      ]
    };
    res.json(geojson);
  });

  app.get('/admin', (req, res) => {

    res.render('querry');
  });

  app.post('/api', (request, response) => {
    console.log(request.body);
    const data =  request.body;
    response.json({
      status: 'Success',
      latitude : data.lat,
      longitude: data.lon
    });
  })

  // app.post('', (req, res) => {
  //   let sampleFile;
  //   let uploadPath;

  //   if (!req.files || Object.keys(req.files).length === 0) {
  //     return res.status(400).send('No files were uploaded.');
  //   }
  //   sampleFile = req.files.sampleFile;
  //   console.log(sampleFile);

// upload image files to server
app.post("/user", function(request, response) {
  var images = new Array();
  if(request.files) {
      var arr;
      if(Array.isArray(request.files.filesfld)) {
          arr = request.files.filesfld;
      }
      else {
          arr = new Array(1);
          arr[0] = request.files.filesfld;
      }
      for(var i = 0; i < arr.length; i++) {
          var file = arr[i];
          if(file.mimetype.substring(0,5).toLowerCase() == "image") {
              images[i] = "/" + file.name;
              file.mv("./upload" + images[i], function (err) {
                  if(err) {
                      console.log(err);
                  }
              });
          }
      }
  }
  // give the server a second to write the files
  setTimeout(function(){response.json(images);}, 1000);
});

    app.post('/login', async (req, res) => {
      req.session.email = req.body.email;
      req.session.psw = req.body.psw;
      let sql = await db.get('Select * from signup where Email = ?', req.session.email);
      console.log(sql)
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
        if(sql.type_of_user == 'user') res.redirect('/user');
        else  res.redirect('/admin');
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