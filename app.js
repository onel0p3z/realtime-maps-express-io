var express = require('express.io'),
    path = require('path'),
    app = module.exports = express().http().io(),
    mongoose = require('mongoose');
    //dbauth = require('./dbauth');

mongoose.connect('mongodb://localhost/mianode');

app.configure(function(){
    app.set('views', __dirname + '/views' );
    app.set('view engine', 'jade');
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.static(path.join(__dirname , '/public')));
});

var db = mongoose.connection;

db.on('error', function(){
    console.log('connection error to db ...\n');
});
db.once('open', function(){
    console.log('connection successful to db');
});

var locSchema =  new mongoose.Schema({
    name: String,
    id: String,
    ipAdd: String,
    latlng: { lat: Number, lng: Number },
    userAgent: String,
    timestamp: { type: Date, default: Date.now }
    }, 
    { collection: 'users' },
    { safe: 'safe' });

var location = mongoose.model('location', locSchema);

app.io.configure(function() {
    app.io.enable('browser client minification');  // send minified client
    app.io.enable('browser client gzip');          // gzip the file
    //app.io.set('log level', 1);                    // reduce logging
});

//var NODE_ENV = 'development';
//app.configure('development', function(){app.use(express.errorHandler({dumpExceptions: true,showStack: true}));});

app.get('/', function(req , res){
    res.render('layout', {
                            title: 'My GeoLoc Map',
                            description: 'This is my first GeoLoc map'
                         }
    );
});

app.io.route('ready', function(req){
    req.io.respond({ status: 'ACKd' })
});

app.io.route('myLoc', function(req){
    console.log('myLoc fired!');
    //console.log(req);
    var obj = {};
    obj.name = req.name || 'username',
    obj.data = req.data,
    obj.id = req.io.socket.id,
    obj.ua = req.headers['user-agent'],
    obj.address = req.handshake.address.address;
    req.io.broadcast('usrsLoc', obj);
    
    var loc = new location({
        name: obj.name,
        id: obj.id,
        ipAdd: obj.address,
        latlng: { lat: obj.data.latlng.lat, lng: obj.data.latlng.lng },
        userAgent: obj.ua,
        timestamp: new Date
    });
    
    // Save to MongoDB
    loc.save(function (err) {
        if (err) return handleError(err);
        // saved!
    });
});

app.listen(8080, function(){
    console.log('Express running at localhost on port 8080   ... ');
});
