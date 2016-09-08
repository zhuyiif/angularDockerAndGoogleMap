var amqp = require('amqplib/callback_api');
var domain = require('domain')
var path = require('path');
var app  = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var base64 = require('base64-js');

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.get('*', function(req, res){
    //console.log(" route = " + req.url);
    //console.log(" sending " + __dirname + req.url);
    res.sendFile(__dirname + req.url);
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

var allSockets = []

////////////////////////////////////////////////////
// ExpressJS routing

var rmqUser = process.env.RABBITMQ_CATALYST_USER || "admin"
var rmqPassword = process.env.RABBITMQ_CATALYST_PASSWORD || "admin_password"
var rmqQueue = process.env.QUEUE_NAME || "1_analysis_2"
//

var dom = domain.create()
dom.on('error', gracefullStart);

function gracefullStart() {
    amqp.connect('amqp://' + rmqUser + ':' + rmqPassword + '@10.200.16.14:5672', function(err, conn){
        dom.add(conn);
        conn.createChannel(function(err,ch) {
            ch.consume(rmqQueue, function(msg){
                console.log("message consumed: ");
                console.log(msg);
                data = {
                    'lat': parseFloat(msg.content.toString().split(',')[0]),
                    'lng': parseFloat(msg.content.toString().split(',')[1])
                }
                for(var i=0; i<allSockets.length ; i++){
                    allSockets[i].emit('gpsData', data);
                }
                ch.ack(msg)

            });
        });
    });
}

gracefullStart()
//
// ////////////////////////////////////////////////////
// // Socket.IO communication
//
io.on('connection', function(socket) {

    socket.on('join', function(body){
      allSockets.push(socket);
    })

    socket.on('disconnect', function() {
        console.log('A user disconnected');
    });
});
