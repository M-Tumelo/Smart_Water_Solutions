let express = require('express');
const fileUpload = require('express-fileupload');
//const FileType = require('file-type');
const nodemailer = require('nodemailer');

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
app.use(fileUpload());
// app.use(express.static('modelAI'));



 //app.use(express.static('modelAI'))


open({
  filename: './data.db',
  driver: sqlite3.Database
}).then(async function (db) {

  // run migration

  await db.migrate();

  // only setup the routes once the database connection has been established

  //getting queries data and name of the user from the database
  const queryQ = await db.all('select * from query');
  var upload;
  var lon;
  var lat;

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
    console.log(req.body);

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

  app.post('/uQuerry', async (req, res) => {
    const { Query } = req.body;

    if (!Query) {
      // nothing is added
      return res.redirect('/user');
    }
    console.log(req.body.discript);
    const insertData = ('INSERT INTO QUERiES (long,lat,discript,image)  VALUES (?,?,?)');
    await db.run(insertData, req.body.long, req.body.lat, req.body.descript, req.body.image);
  });
  app.get('/uQuerry', async (req, res) => {

    const queryQ = await db.all('select * from QUERiES');
    res.render('user', { queryQ })
  });
  app.get('/about', async (req, res) => {
    res.render('about')
  });
  app.get('/class', (req, res) => {    
    res.render('class');
  })

  app.post('/class', (req, res) => {
    res.redirect('/user');
  })

  app.get('/contact', async (req, res) => {
    res.render('contact')
  });

app.get('/contact', async (req, res) => {
  res.render('contact')
});

app.post('/contact', (req, res) => {
  const output = `
    <p>You have a new contact request</p>
    <h3>Contact Details</h3>
    <ul>  
      <li>Name: ${req.body.name}</li>
      <li>Company: ${req.body.company}</li>
      <li>Email: ${req.body.email}</li>
      <li>Phone: ${req.body.phone}</li>
    </ul>
    <h3>Message</h3>
    <p>${req.body.message}</p>
  `;

  let transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false, 
    auth: {
        user: 'kaylah.pfeffer26@ethereal.email', 
        pass: 'kdrPZj4eMzK32pADj3'  
    },
    tls:{
      rejectUnauthorized:false
    }
  });

  let mailOptions = {
      from: '"Nodemailer Contact" <kaylah.pfeffer26@ethereal.emai>', // sender address
      to: 'cktshukudu@gmail.com', // list of receivers
      subject: 'Water Leaks', // Subject line
      text: 'Hello world?', // plain text body
      html: output // html body
  };


  transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
          return console.log(error);
      }
      console.log('Message sent: %s', info.messageId);   
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

      res.render('contact', {msg:'Email has been sent'});
  });
  });
  app.post('/remove/:id', async function (req, res) {

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
    const data = request.body;
    response.json({
      status: 'Success',
      latitude: data.lat,
      longitude: data.lon
    });
  });

  app.get('/admin', async (req, res) => {
    const username = await db.all('select * from signup where email = ?', req.session.email);
    res.render('querry');
  });

  app.get('/sense', (req, res) => {

    res.render('sense');
  });

  app.post('/sense', async (req, res) => {


    const insertData = ('INSERT INTO QUERY (name,longitude,lattitude,query,date)  VALUES (?,?,?,?,?)');
    await db.run(insertData, 'Sense', req.body.long, req.body.lat, req.body.Descript, moment(new Date()).format('MMM D, YYYY'));
  });

  app.get('/ad', async (req, res) => {
    const username = await db.all('select * from signup where email = ?', req.session.email);
    res.render('admin', {
      queryQ,
      username
    });
  });

  app.get('/ds/:id', async (req, res) => {
    const getQuery = await db.get('select * from query where id = ?', req.params.id);
    // console.log(getQuery);
    res.redirect('/admin')
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
  app.post("/user", async function (req, response) {
    var images = new Array();
    lat = req.body.lat;
    lon = req.body.lon;
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
      else res.redirect('/admin');
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

  //});
  app.listen(PORT, function () {
    console.log('App starting on port', PORT);
  });
});
