const cpuTiles = []
const playerTiles = []

let cpuTurn = true;
let playerTurn = false;
let gameOver = false;
const playerColor = "#F74F25";
const cpuColor = "#F7E625";
const winningCombinations = []

cpuMove()

$(".column").on("click", function(){
    if(playerTurn == true){
        let colNo = this.getAttribute("col-no");
        let leftRow = this.getAttribute("left-row");
        if(leftRow>0){
            document.getElementById("c"+colNo).children[leftRow-1].style.background = playerColor;
            if (leftRow >= 1){
                document.getElementById("c"+ colNo).setAttribute("left-row", leftRow-1)
            }
            playerTurn == false;
            let circle = (colNo*6) - (6-leftRow)//DİSK HANGİ BOŞLUĞA DÜŞTÜ
            playerTiles.push(circle);
            if(checkForWin(playerTiles)){
                restartTheGame(player)
            }
            else{
                cpuMove()
            }
        }
        
    }
})

function cpuMove(){
    var randomSayi = Math.floor(Math.random() * (7 - 1 + 1)) + 1;
    const column = document.getElementById("c"+ randomSayi);
    let leftRow = column.getAttribute("left-row");
    if(leftRow > 0){
        column.children[leftRow -1].style.background = cpuColor;
    }
    if(leftRow>=1){
        column.setAttribute("left-row", leftRow-1)
    }
    let circle = (randomSayi*6)- (6-leftRow)
    cpuTiles.push(circle);
    if(checkForWin(cpuTiles)){
        restartTheGame(cpu)
    }
    else{
        playerTurn = true;
    }

}

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
                return true        
    }
    else{
        return false
    }
    }
}
function restartTheGame(winner){
    console.log("winner var");
}