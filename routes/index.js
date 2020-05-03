const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const mongoDB = 'mongodb://127.0.0.1/my_database'
mongoose.connect(mongoDB, {useNewUrlParser: true});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error: '));

/* GET home page. */
router.get('/', function(req, res, next) {
  res.sendFile( "index.html");

  let socket_id = [];
  const io = req.app.get('socketio');

  io.on('connection', socket => {
    socket_id.push(socket.id);
    if (socket_id[0] === socket.id) {
      // remove the connection listener for any subsequent
      // connections with the same ID
      io.removeAllListeners('connection');
    }

    socket.on('hello message', msg => {
      console.log('just got: ', msg);
      socket.emit('chat message', 'hi from server');

    })

  });

});

module.exports = router;

