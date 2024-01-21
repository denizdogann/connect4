const socket = io.connect('https://connect4-demo.onrender.com');
//const socket = io.connect('http://localhost:3000/');
const copyIcon = document.getElementById("copy-icon");
const copyText = document.getElementById("share-room-link");
const shareLinkBox = document.getElementById("share-link");
const resultBox = document.getElementById("result");
const resultMsg = document.getElementById("result-msg");

let me = "player1";
let opp = "player2";

let gameOver = false;
let myColor = "white"
let oppColor = "black";
let oppScore = 0;
let myScore = 0;

let myTurn = false;
let chosenTiles = [];
const winningCombinations = [];
const playAgain = document.createElement("button");
playAgain.innerHTML = "PLAY AGAIN?";
document.body.appendChild(playAgain);
playAgain.classList.add("play-again-nodisplay")


copyIcon.addEventListener("click", function() {
    copyText.select();
    copyText.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(copyText.value);
});

socket.emit("new-user", { //YENİ BİR KULLANICININ ODAYA GİRDİĞİNİ
    roomID:roomID         // SUNUCUYA BİLDİRİR
});

socket.on("room-full", ()=>{ //SUNUCUDAN GELEN ODA DOLU
    shareLinkBox.style.display = "none" // ETKİNLİĞİ KARŞILANIR
});

socket.on("color-assign", (data)=>{
    myColor= data.myColor;
    oppColor = data.oppColor;
    myTurn = data.yourTurn;
    if(data.player == "p1"){
        me = "p1"
        opp = "p2"
    }
    else if(data.player == "p2"){
        me = "p2"
        opp = "p1"
    }

});

$(".column").on("click", function(){
    let colNo = this.getAttribute("col-no");
    let leftRow = this.getAttribute("left-row");
    if(myTurn == true && leftRow>0){ 
        let circle = (colNo*6) - (6-leftRow)//DİSK HANGİ BOŞLUĞA DÜŞTÜ
        chosenTiles.push(circle);
        socket.emit("clicked", {colNo:colNo, leftRow:leftRow});
        if (leftRow >= 1){
            this.setAttribute("left-row", leftRow - 1)
        }
        checkForWin(chosenTiles)
    }   
})

socket.on("opp-move", (data)=>{
    let leftRow = data.leftRow;
    let selectedTile = document.getElementsByClassName("column").item(data.colNo - 1);
    console.log(selectedTile.getAttribute("left-row"));
    selectedTile.children[leftRow - 1].style.backgroundColor = oppColor;
    if(leftRow >=1){
        selectedTile.setAttribute("left-row", leftRow -1)
    }
    myTurn = data.yourTurn
    document.getElementById(me + "-your-turn").classList.remove("your-turn");
    
})

socket.on("your-move", (data)=>{
    let leftRow = data.leftRow;
    let selectedTile = document.getElementsByClassName("column").item(data.colNo - 1);
    console.log(selectedTile.getAttribute("left-row"));
    selectedTile.children[leftRow - 1].style.backgroundColor = myColor
;
    myTurn = data.yourTurn;
    document.getElementById(me + "-your-turn").classList.add("your-turn");
});


socket.on("you-won",()=>{ 
    myTurn = !myTurn;
    resultMsg.innerHTML = "YOU WON!"
    resultBox.style.display = "inline-block";
    resultMsg.style.color = "#4FC474";
    resultBox.classList.add("animate-in-out");
    document.getElementById(me+"-score").innerHTML =myScore + 1; 
    setTimeout(function(){
        playAgain.classList.remove("play-again-nodisplay")
        playAgain.classList.add("play-again")
    },6000)
})

socket.on("you-lost",()=>{
    myTurn = !myTurn;
    resultMsg.innerHTML = "YOU LOST!"
    resultBox.style.display = "inline-block";
    resultMsg.style.color = "#CC5452";
    resultBox.classList.add("animate-in-out");
    document.getElementById(opp+"-score").innerHTML = oppScore + 1;
    setTimeout(function(){
        playAgain.classList.remove("play-again-nodisplay")
        playAgain.classList.add("play-again");
    },6000)
})

socket.on("restart",()=>{
    console.log("OYUN YENİDEN OYNANACAK")
    restartTheGame()
})

playAgain.addEventListener("click", ()=>{
    playAgain.classList.add("play-again-nodisplay")
    socket.emit("play-again-req", {socket:socket.id})
})



//ALL WINNING COMBINATIONS
//VERTICAL
for(let i=1; i<38; i = i+6){
    for(let j = i; j < i + 3; j++){
      const arr= [j, j + 1, j + 2,j + 3];
      winningCombinations.push(arr)
    }
} 

//HORIZONTAL
for(let i=1; i<7; i++){
    for(let j=i; j < i+19; j = j+6){
      const arr= [ j, j+6, j+12, j+18];
      winningCombinations.push(arr)
    }
}

//CROSS
for(let i=4;i<7;i++){
    for(let j=i;j<i+19;j=j+6){
      const arr=[j,j+5,j+10,j+15]
      winningCombinations.push(arr)
    }
} 
for(let i =1; i<20; i=i+6){
    for (let j = i;j<i+4;j++){
      const arr=[j,j+7,j+14,j+21]
      winningCombinations.push(arr)
    }
}



function checkForWin(chosenTiles){
    for(let i = 0; i < winningCombinations.length; i++){
        const circle1 = winningCombinations[i][0];
        const circle2 = winningCombinations[i][1];
        const circle3 = winningCombinations[i][2];
        const circle4 = winningCombinations[i][3];
        if(
            chosenTiles.includes(circle1) && chosenTiles.includes(circle2) &&
            chosenTiles.includes(circle3) && chosenTiles.includes(circle4)) {
                gameOver = true;
                resultBox.classList.add("animate-in-out");
                console.log("WINNER")
                socket.emit("winner");        
    }
    }
}


function restartTheGame(){
    playAgain.classList.add("play-again-nodisplay")
    playAgain.classList.remove("play-again");
    resultBox.style.display = "none"
    chosenTiles = [];
    const boxes = document.getElementsByClassName("box");
    const columns = document.getElementsByClassName("column");
    for(box of boxes){
        box.style.backgroundColor = "#8558f7";
    }
    for(col of columns)[
        col.setAttribute("left-row", 6)
    ]
}