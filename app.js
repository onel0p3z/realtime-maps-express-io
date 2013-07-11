var express = require('express.io'),
    path = require('path'),
    app = module.exports = express().http().io();

app.configure(function(){
    app.set('views', __dirname + '/views' );
    app.set('view engine', 'jade');
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.static(path.join(__dirname , '/public')));
});

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
    obj.data = req.data,
    obj.id = req.io.socket.id,
    obj.address = req.handshake.address.address;
    req.io.broadcast('usrsLoc', obj);
});

app.listen(8080, function(){
    console.log('Express running at localhost on port 8080   ... ');
});
