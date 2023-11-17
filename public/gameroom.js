const socket = io.connect('http://localhost:3000');
const copyIcon = document.getElementById("copy-icon");
const copyText = document.getElementById("share-room-link");
const shareLinkBox = document.getElementById("share-link");

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
})

