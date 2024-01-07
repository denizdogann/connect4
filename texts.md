**SERVER SIDE**

const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const server = require('http').Server(app);
const randomstring = require("randomstring"); 
const io = require("socket.io")(server);

Öncelikle express server kurulumu ile başlıyoruz. Express framework'ünü kullanarak bir web uygulaması oluşturmak için gerekli modülleri içerir. express modülü, web sunucu işlevselliğini hızlı ve kolay bir şekilde eklemenizi sağlar. Ardından body-parser modülünü ekliyoruz. body-parser modülü, gelen HTTP isteklerinin body verilerini okuma ve işleme yeteneği sağlar. randomString modülü npm packet managerda bulduğumuz rastgele string karakterleri oluşturan modüldür. Bu modülü unique oda id'leri oluşturmak için kullanacağız. Son olarak socket.io kütüphanesi web uygulamaları arasında çift yönlü iletişimi sağlamak üzere tasarlanmış bir kütüphanedir. Sunucu ve client arasında gerçek zamanlı veri iletimi için kullanılır. const io = require("socket.io")(server); ifadesi ile oluşturulan io nesnesi, sunucu tarafında WebSocket protokolü üzerinden bağlantıları yönetir ve clientlarla iletişim kurmaya olanak tanır.


app.set('views', './views');
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

View engine'i ve görüntüleme dosyalarını burada belirtiyoruz. View engine(görünüm motoru) olarak "EJS" kütüphanesini seçildi. Embedded JavaScript (EJS), JavaScript kodunu HTML sayfalarının içine yerleştirmek için kullanılan bir görünüm motorudur. Dinamik içerik oluşturma olanağı sağlar. Ayrıca express serverının JSON verilerini işleyebilmesi için yukarıda eklediğimiz body-parser modülü kullanışmıltır.


server.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});

Yerel sunucu kuruldu ve 3000. porttan dinleniyor.



app.get("/", (req, res)=>{
  const roomID = randomstring.generate(10);
  rooms[roomID] = { "users": [] }
  res.render("index", {roomID:roomID});
});


Home route'unda kullanıcıyı index sayfasına yönlendiriyoruz. Index sayfasında onu başka bir sayfaya (oyun odası) yönlendirecek roomID'de randomstring modülü ile burada oluşturuluyor. Serverda oluşturulan odaların bulunduğu odalar arrayine de bu unique ID ekleniyor.



app.get("/room/:roomID", (req,res)=>{
  const roomID = req.params.roomID;
  if (rooms[roomID]["users"].length >= 2 ){
    return res.redirect("/")
  }
  
  res.render("gameroom", {roomID:roomID});
});

Oyuncunun unique ID'si ile girdiği odanın route'unda oyun sayfası render ediliyor. Ayrıca eğer odadaki oyuncu sayısını kontrol ediliyor. Oyuncu sayısı ikiden fazlaysa client home route'a yönlendiriliyor. 



io.on('connection', socket => {
  socket.on('new-user', (data) => {
    const roomID = data.roomID;
    console.log("ODA ID: " + roomID)
    if(rooms[roomID]["users"].length < 3){
      rooms[roomID]["users"].push(socket.id);
      socket.join(roomID);
    }
    if(rooms[roomID]["users"].length ==2){
      io.to(roomID).emit("room-full");
      io.to(rooms[roomID]["users"][0]).emit("color",{tileColor:"red" ,oppColor:"yellow", "yourTurn":true});
      io.to(rooms[roomID]["users"][1]).emit("color",{tileColor:"yellow", oppColor:"red", "yourTurn":false});
    }
    ;
    console.log(rooms);
    socket.on("clicked", (data)=>{
      if(socket.id === rooms[roomID]["users"][0]){
        io.to(rooms[roomID]["users"][1]).emit("opp-move",{
          colNo:data.colNo,
          leftRow:data.leftRow
        });
        io.to(rooms[roomID]["users"][0]).emit("your-move",{
          colNo:data.colNo,
          leftRow:data.leftRow
        });
      }
      if(socket.id === rooms[roomID]["users"][1]){
        io.to(rooms[roomID]["users"][0]).emit("opp-move",{
          colNo:data.colNo,
          leftRow:data.leftRow
        });
        io.to(rooms[roomID]["users"][1]).emit("your-move",{
          colNo:data.colNo,
          leftRow:data.leftRow
        });
        
      }
      //io.to(roomID).emit("affirm")
      //io.to(rooms[roomID]["users"][0]).emit("color",{tileColor:"red"});
      //io.to(rooms[roomID]["users"][1]).emit("color",{tileColor:"yellow"})
    })
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
})


Bu büyük blokta kullanıcılar ve server arasındaki server-side iletişim görülmektedir. Öncelikle proje kurulumunda oluşturduğumuz io nesnesi ile bağlantı kurulduğunda tetiklenecek kod bloğumuz var. Bu fonksiyon bir socket objesi döndürür. Bu socket clientımızı temsil eder. Bundan sonra gerçekleşecek çoğu fonksiyon, clientside bir javascript programındaki eventListener'ları andırır. Socket'in yaptığı bir etkinliği dinleyebiliriz "socket.on" ya da ona bir etkinlik yayınlayabiliriz "socket.emit". Bu prensip aynı şekilde clientside'da da geçerlidir. Aynı şekilde son bağlantı kesilmesi durumunda yani clientın odayı terketmesi durumunda disconnecting eventi tetiklenir ve server haberdar edilir. SocketID odadaki kullanıcılar listesinden çıkarılır. 

İlk olarak socket bağlantısında odanın dolu olup olmadığını kontrol ediyoruz. Kullanıcı sayısı ikiden az olduğu sürece rooms objemizin uygun roomID değerine kullanıcıların socket id'lerini ekliyoruz. Odadaki oyuncu sayısı ikiye ulaştığında "Oda Dolu" etkinliğini socketlara yayınlıyoruz("socket.emit"). Bu kod client tarafında karşılanacak ve odanın linkini paylaşmayı durduruyor ve oyunun başladığın iki oyuncunun da odada mevcut olduğunu bildiriyor. Socketlar yayınlanan "yourTurn" parametresi ile oyunculara sıraları, "tileColor" ile taşlarının rengi "oppColor" ile de rakiplerinin taş rengi bildiriliyor.

Oyunculardan yayınlanan "tıklandı" etkinliği dinlenir. Burada hangi oyuncunun hangi kolona tıkladığı, tıkladığı kolonda kaç boşluk kaldığı bilgisi client tarafından aktarılır. Dinlenen etkinlikten gelen bilgi iki oyuncuya da yayınlanır. Tıklayan oyuncu bu bilgi ile sıranın ondan geçtiğini tekrar teyit eder ve client side'da kendi taşının oyuna sokulduğunu görür, aynı şekilde karşı oyuncu da kendisine karşı yapılan hamleyi görür ve sıranın ona geldiği bilgisine ulaşır.

**CLIENT SIDE**

const socket = io.connect('http://localhost:3000');
const copyIcon = document.getElementById("copy-icon");
const copyText = document.getElementById("share-room-link");
const shareLinkBox = document.getElementById("share-link");

Öncelikle socket nesnesi oluşturulur ve yerel sunucuya bağlanılır. Daha sonrasında hızlıca erişmek için DOM manipülasyonunda kullanacağımız HTML elementlerinin instancelarını oluşturulur.

let tileColor = "white"
let oppColor = "black";
let myTurn = false;

Oyunu kodlarken sıklıkla kullanacağımız parametrelerin instanceleri oluşturulup göstermelik değerler atanır. Burada değişkeni belirtirken let keywordünü tercih edildi çünkü ilerleyen bölümde değerler dinamik olarak değiştirilecek.

copyIcon.addEventListener("click", function() {
    copyText.select();
    copyText.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(copyText.value);
});

Burada copyIcon elementine tıklandığına input kutusunu kopyalama işlevi gerçekleşiyor böylece kullanıcının linki otomatik olarak kopyalayıp paylaşması sağlanıyor. 

socket.emit("new-user", {
    roomID:roomID
})

Kullanıcı odaya girdiğinde servera yeni kullanıcı etkinliği yayınlıyoruz ve EJS motorundan dinamik gelen roomID'yi de servera bildiriliyor.

socket.on("room-full", ()=>{
    shareLinkBox.style.display = "none"
});

Odanın dolu olduğu yayını burda dinleniyor. Bu durumda kullanıcı oda linki kutusunu görmeyi bırakabilir ve oyun sayfası tam olarak oyuncuya gösterilir.

socket.on("color", (data)=>{
    tileColor = data.tileColor;
    oppColor = data.oppColor;
});

Oyuncu serverdan gelen renk atamasını dinler. Kod tetiklendiğinde client tarafındaki renk atamaları tanımlanmış olur. 


$(".column").on("click", function(){
    let colNo = this.getAttribute("col-no");
    let leftRow = this.getAttribute("left-row");
    socket.emit("clicked", {colNo:colNo, leftRow:leftRow});
    if (leftRow >= 1){
        this.setAttribute("left-row", leftRow - 1)
    }
})

Kolonlardan birine tıklandığında bu eventListener tetiklenir. Hangi kolona tıklandığı ve kaç boş alanın kaldığı bilgisi servera "tıklandı" etkinliği ile yayınlanır. Daha sonra kalan boşluk sayısı düşürülür.


socket.on("your-move", (data)=>{
    let leftRow = data.leftRow;
    let selectedTile = document.getElementsByClassName("column").item(data.colNo - 1);
    console.log(selectedTile.getAttribute("left-row"));
    selectedTile.children[leftRow - 1].style.backgroundColor = tileColor;
});

Serverdan gelecek "senin hamlen" etkinliği dinlenir. Tetiklendiğinde kullancıı kendi tıkladığı kolona hamle yapmış olur, seçili kolonun boş olan en alt alanı kullanıcının rengindeki taş ile doldurulur.



socket.on("opp-move", (data)=>{
    let leftRow = data.leftRow;
    let selectedTile = document.getElementsByClassName("column").item(data.colNo - 1);
    console.log(selectedTile.getAttribute("left-row"));
    selectedTile.children[leftRow - 1].style.backgroundColor = oppColor;
    if(leftRow >=1){
        selectedTile.setAttribute("left-row", leftRow -1)
    }    
})

Serverdan gelen "karşı hamle" etkinliği ile kullanıcı karşı oyuncunun hamlesi ile ilgili bilgilendirilir. Seçili taş karşı kullanıcının rengi ile doldurulur ve o kolondaki boş alan sayısı birer azaltılır.


