/*
품명 : webRTC ShareVideo,Screen
기능 : 관리자에서는 유저에 모습을 볼수 있고, 유저는 영상녹화 및 화면공유화면 녹화기능 구현
문제점 : 서버에러가 발생해 받아오지 못하는 에러
*/
const express = require('express');
const app = express();
const fs = require('fs');
const http = require('http');
const https = require('https');



const privateKey = fs.readFileSync('/etc/letsencrypt/live/utest.soymlops.com/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/utest.soymlops.com/cert.pem', 'utf8');
const ca = fs.readFileSync('/etc/letsencrypt/live/utest.soymlops.com/chain.pem', 'utf8');

const credentials = {
	key: privateKey,
	cert: certificate,
	ca: ca
};

// ejs 파일을 열수있게 한다.
app.set('view engine', 'ejs'); 
app.use(express.static('public')); 
// app.use(require('helmet')());

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



const httpServer = http.createServer(app);
const httpsServer = https.createServer(credentials, app);


httpServer.listen(80, () => {
	console.log('UTEST wrtc 0.37 HTTP Server running on port 80');
});

httpsServer.listen(443, () => {
	console.log('UTEST wrtc 0.37 HTTPS Server running on port 443');
});

const io = require('socket.io')(httpsServer);

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