var express = require('express');
var Session = require('express-session');
var fs = require('fs-extra');
var util = require('util');
var socket = require('socket.io');
var ios = require('socket.io-express-session');
var FileStore = require('session-file-store')(Session);
var cors = require('cors');

var path = require('path');
var https      = require('https');
var http      = require('http');
var favicon = require('serve-favicon');
var morgan = require('morgan');

var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

var formidable = require('formidable');


require('./lib/model.js');

/*
var options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('key-cert.pem')
}
*/

var app     = express();
var server  = http.createServer(app);
// var server  = https.createServer(options,app);

var accessLogStream = fs.createWriteStream(__dirname + '/access.log', {flags: 'a'})
app.use(morgan('combined', {stream: accessLogStream}))

var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var db = mongoose.connect('mongodb://localhost/kerawenroll');

var session = Session({
    store: new FileStore,
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
  })

app.use(cors());
app.use(session);

var io = socket.listen(server);
io.use(ios(session));


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session);

// app.use('/', routes);
// app.use('/users', users);


// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

var caissesSockets = []
io.on("connection",function(socket)
  {   
    console.log(socket.id) ;

    socket.on("enregistrer",function(sockName) {
        caissesSockets[sockName] = { "socket": socket.id } 
        console.log(caissesSockets);
    })

    socket.on("ticket:"+socket.handshake.query.url_longue+":"+socket.handshake.query.magasin+":"+socket.handshake.query.caisse,function(ticket) {
          var to_caisse = socket.handshake.query.url_longue+socket.handshake.query.magasin+socket.handshake.query.caisse ;
          if (caissesSockets[to_caisse]) {
            var id = caissesSockets[to_caisse].socket ;
            io.sockets.connected[id].emit("affiche_ticket",ticket); 
          } else {
            socket.emit("caisse:out");
          }
    })

    socket.on("affiche_pub",function() {
      var to_caisse = socket.handshake.query.url_longue+socket.handshake.query.magasin+socket.handshake.query.caisse
          var id = caissesSockets[to_caisse].socket;
          io.sockets.connected[id].emit("affiche_pub");
    })
  }
)

//--- Afficheur
app.get("/mag/:url_longue/:mag/:caisse",function(req,res) {
  
/*
    io.on("connection",function(socket) {
      session.magasin = "XOUXOU";
       console.log("La caisse "+req.params.caisse+ "du magasin "+req.params.mag+"s'est connectéé" );
       socket.on("ticket:"+req.params.mag+":"+req.params.caisse, function(ticket){console.log("ticket",ticket)})
    })
*/

  res.render('index', { title: 'CAISSE KERAWEN' ,  url_longue: req.params.url_longue, magasin: req.params.mag , caisse: req.params.caisse  });
})


var Controller = require('./lib/controller.js');

//--- enrollement.
app.post('/enroll',Controller.addCaisse) ;

//--- upload image + css.

app.get('/formupload/:mag/:caisse',function(req,res) {
    res.render("formupload",{title:'gestion de la pub'});
})

//---

var makePath = function(path) {
  try {
    fs.mkdirSync(path);
  } catch(e) {
    if ( e.code != 'EEXIST' ) throw e;
  }
}


app.post('/upload/', function (req, res) {
    var fields = []
    var form = new formidable.IncomingForm();

    form.on('field',function(field,value){
           fields[field]=value;
    })

    form.on('fileBegin', function (name, file) {
        file.path = __dirname + '/uploads/' + file.name;
    });

    form.on('progress', function(bytesReceived, bytesExpected) {
         console.log('progress')
    });

    form.on('file', function (name, file) {
        console.log('Uploaded ' + file.name); 
    
        fs.ensureDir('public/uploads/'+fields['magasin']+'/'+fields['caisse']+'/',function(){
          var source = fs.createReadStream(__dirname + '/uploads/' + file.name);
          var dest =  fs.createWriteStream(__dirname + '/public/uploads/' + fields['magasin'] + '/' + fields['caisse'] + '/' + fields['nomfichier']);

          source.pipe(dest);
          source.on('end', function() { console.log('copied'); });
          source.on('error', function(err) { console.log('error'); });
        })
    });

    form.parse(req, function(err, fields, files) {
      console.log('parse');
      res.writeHead(200, {'content-type': 'text/plain'});
      res.write('received upload:\n\n');
      res.end(util.inspect({fields: fields, files: files}));    
    });
  
});



server.listen(3030)
