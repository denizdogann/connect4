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

const rooms = {};
const roomsArr = []
let responses = 0;

app.get("/", (req, res)=>{
  let roomID = randomstring.generate(15);
  while(roomID in roomsArr){
    roomID = randomstring.generate(15)
  }
  roomsArr.push(roomID);
  rooms[roomID] = { "users": [] }
  res.render("index", {roomID:roomID});
});

app.get("/room/:roomID", (req,res)=>{
  const roomID = req.params.roomID;
  if (rooms[roomID]["users"].length >= 2 ){
    return res.redirect("/")
  }
  
  res.render("gameroom", {roomID:roomID});
});

app.get("/vscpu", (req,res)=>{
  res.render("vscpu")
})


io.on('connection', socket => {
  socket.on('new-user', (data) => { // TARAYICIDAN GELEN ETKİNLİK KARŞILANIR
    const roomID = data.roomID;
    if(rooms[roomID]["users"].length < 3){
      rooms[roomID]["users"].push(socket.id);
      socket.join(roomID);
    }
    if(rooms[roomID]["users"].length ==2){ 
      io.to(roomID).emit("room-full"); // OYUN ODASININ DOLDUĞU BİLDİRİLİR
      io.to(rooms[roomID]["users"][0]).emit("color-assign",
      {myColor:"#F74F25", 
      oppColor:"#F7E625", 
      "yourTurn":true, 
      "player":"p1"});
      io.to(rooms[roomID]["users"][1]).emit("color-assign",
      {myColor:"#F7E625", 
      oppColor:"#F74F25", 
      "yourTurn":false, 
      "player":"p2"});
    };
    console.log(rooms);
    socket.on("clicked", (data)=>{
      if(socket.id === rooms[roomID]["users"][0]){
        io.to(rooms[roomID]["users"][1]).emit("opp-move",{
          colNo:data.colNo,
          leftRow:data.leftRow,
          "yourTurn":true
        });
        io.to(rooms[roomID]["users"][0]).emit("your-move",{
          colNo:data.colNo,
          leftRow:data.leftRow,
          "yourTurn":false
        });
      }
      if(socket.id === rooms[roomID]["users"][1]){
        io.to(rooms[roomID]["users"][0]).emit("opp-move",{
          colNo:data.colNo,
          leftRow:data.leftRow,
          "yourTurn":true
        });
        io.to(rooms[roomID]["users"][1]).emit("your-move",{
          colNo:data.colNo,
          leftRow:data.leftRow,
          "yourTurn":false
        });  
      }})
      socket.on("winner", (data)=>{
        if(socket.id === rooms[roomID]["users"][0]){
          io.to(rooms[roomID]["users"][0]).emit(("you-won"));
          io.to(rooms[roomID]["users"][1]).emit(("you-lost"))
        }
        if(socket.id === rooms[roomID]["users"][1]){
          io.to(rooms[roomID]["users"][1]).emit(("you-won"));
          io.to(rooms[roomID]["users"][0]).emit(("you-lost"))
        }
      })
      
      socket.on("play-again-req",(data)=>{
        responses++;
        if(responses === 2){
          io.to(roomID).emit("restart")
          responses = 0;
        }
        console.log("YENİDEN OYNA  ", responses)
        
      })

      

    }

      
    
  )
  
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
})



server.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});