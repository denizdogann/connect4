const socket = io();

    function joinRoom() {
      const roomName = document.getElementById('roomName').value;
      socket.emit('joinRoom', roomName);
    }

    function leaveRoom() {
      const roomName = document.getElementById('roomName').value;
      socket.emit('leaveRoom', roomName);
    }

    function sendMessage() {
      const roomName = document.getElementById('roomName').value;
      const message = document.getElementById('message').value;
      socket.emit('message', roomName, message);
    }

    socket.on('message', (message) => {
      const messages = document.getElementById('messages');
      const li = document.createElement('li');
      li.textContent = message;
      messages.appendChild(li);
    });