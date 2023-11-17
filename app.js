const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const server = require('http').Server(app);
const io = require("socket.io")(server);
const randomstring = require("randomstring");

app.set('views', './views');
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

const rooms = {}
let flag = true;

app.get("/", (req, res)=>{
  const roomID = randomstring.generate(10);
  rooms[roomID] = { "users": [] }
  res.render("index", {roomID:roomID});
});

app.get("/room/:roomID", (req,res)=>{
  const roomID = req.params.roomID;
  if (rooms[roomID]["users"].length >= 2 ){
    return res.redirect("/")
  }
  
  res.render("gameroom", {roomID:roomID});
})



io.on('connection', socket => {
  socket.on('new-user', (data) => {
    const roomID = data.roomID;
    console.log("ODA ID: " + roomID)
    if(rooms[roomID]["users"].length < 3){
      rooms[roomID]["users"].push(socket.id);
      socket.join(roomID);
    }
    if(rooms[roomID]["users"].length ==2){
      io.to(roomID).emit("room-full") 
    }
    console.log(rooms);
  })
  socket.on('disconnecting', () => {
    console.log("socket bağlantıyı kesti: " + socket.id);
    for (const property in rooms) {
      if(rooms[property]["users"].includes(socket.id)){
        const i = rooms[property]["users"].indexOf(socket.id);
        rooms[property]["users"].splice(i,1)
      }
    }
    console.log(rooms);
  });
  /*socket.on('send-chat-message', (room, message) => {
    socket.to(room).broadcast.emit('chat-message', { message: message, name: rooms[room].users[socket.id] })
  })
  socket.on('disconnect', () => {
    getUserRooms(socket).forEach(room => {
      socket.to(room).broadcast.emit('user-disconnected', rooms[room].users[socket.id])
      delete rooms[room].users[socket.id]
    }) 
  }) */
})

/*function getUserRooms(socket) {
  return Object.entries(rooms).reduce((names, [name, room]) => {
    if (room.users[socket.id] != null) names.push(name)
    return names
  }, [])
}
*/


server.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
