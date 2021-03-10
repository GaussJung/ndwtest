const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

// ejs 파일을 열수있게 한다.
app.set('view engine', 'ejs'); 
app.use(express.static('public/js')); 


// 경로가 "/" 일때 main.ejs가 열리고 타이틀에 이름을 변경
app.get('/',(req,res) =>{
    res.render("main",{title : "voiceChat"});
}); 


// 변경된 경로에 room에 파라미터 값을 roomId에 저장 시킨다.
app.get('/voiceroom',(req,res)=>{
    res.render('room');
}); 

// 관리자 화면
app.get('/admin', (req,res)=>{
    res.render('admin', {title: "ADMIN"})
})

// 소켓 서버
io.on('connection', socket =>{
    socket.on('join-room', (roomId, userId) =>{
        socket.join(roomId);
        socket.to(roomId).broadcast.emit("user-connected", userId);
        
        socket.on('disconnect',() =>{
            socket.to(roomId).broadcast.emit('user-disconnected', userId);
        });
    });
});

server.listen(3010,()=>console.log("connect port 3010"));
