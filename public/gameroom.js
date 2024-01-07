const socket = io.connect('http://localhost:3000');
const copyIcon = document.getElementById("copy-icon");
const copyText = document.getElementById("share-room-link");
const shareLinkBox = document.getElementById("share-link");
let tileColor = "white"
let oppColor = "black";
let myTurn = false;

copyIcon.addEventListener("click", function() {
    copyText.select();
    copyText.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(copyText.value);
});

socket.emit("new-user", {
    roomID:roomID
})

socket.on("room-full", ()=>{
    shareLinkBox.style.display = "none"
});

socket.on("color", (data)=>{
    tileColor = data.tileColor;
    oppColor = data.oppColor;
    myTurn = data.yourTurn;
});

$(".column").on("click", function(){
    if(myTurn == true){
        let colNo = this.getAttribute("col-no");
        let leftRow = this.getAttribute("left-row");
        socket.emit("clicked", {colNo:colNo, leftRow:leftRow});
        if (leftRow >= 1){
            this.setAttribute("left-row", leftRow - 1)
        }
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
})

socket.on("your-move", (data)=>{
    let leftRow = data.leftRow;
    let selectedTile = document.getElementsByClassName("column").item(data.colNo - 1);
    console.log(selectedTile.getAttribute("left-row"));
    selectedTile.children[leftRow - 1].style.backgroundColor = tileColor;
    myTurn = data.yourTurn
});