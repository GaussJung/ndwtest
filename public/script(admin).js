const socket = io('/');
const videoArea = document.getElementById("video-grid");
const screenArea = document.getElementById("screen");
const peerServer = new Peer();
let recordVideoBool = true
let shareScreenBool = true;


const peers = {};    // 나간 카메라에 userId를 받아 저장
let room    


    peerServer.on('open', () => {
        socket.emit('join-room',0904, "admin");
    });





// 웹캠화면 출력
    navigator.mediaDevices.getUserMedia({
        video : true
    }).then(stream =>{ 
    
        
    
    
    //자신이 방에 들어 왔을때 추가되는 태그와 영상
        peerServer.on('call', call =>{
            call.answer(stream);
            const video = document.createElement('video');
            call.on('stream', userVideoStream=>{
                addVideoStream(video, userVideoStream);
            });
        }); 
    
        //상대방이 들어왔을때 userId와 영상을 새로 생성 하는 소켓
        socket.on('user-connected', userId =>{
            connectToNewUserVideo(userId, stream);
        });      
    }); 



// 화면 공유 실행
const shareScreen = () =>{
if(shareScreenBool){
    alert("화면공유된 영상은 자동 녹화 가능합니다. 녹화중지가 필요할 경우 화면녹화중지 버튼을 눌러 주세요.")                  
    navigator.mediaDevices.getDisplayMedia({video:true, audio:false}).then(stream =>{
    shareScreenBool = false;
    
    //자신이 방에 들어 왔을때 추가되는 태그와 영상
    peerServer.on('call', call =>{
        call.answer(stream);
        const screen = document.createElement('video');
        call.on('screen', userScreenStream=>{
            addScreenShot(screen, userScreenStream);
        });
    }); 

    //상대방이 들어왔을때 userId와 영상을 새로 생성 하는 소켓
    socket.on('user-connected', userId =>{
        connectToNewUserScreen(userId, stream);
    }); 
    });
};
}
// 상대방이 방에서 나갔을때 영상을 종료하는 소켓
socket.on("user-disconnected", userId =>{
    
    if( peers[userId]) {peers[userId].close();}
});


// 자신이 방에 들어 왔을때 추가되는 태그와 영상
const connectToNewUserVideo = (userId, stream) =>{
    const call = peerServer.call(userId, stream);
    const video = document.createElement('video');
    call.on('stream', userVideoStream =>{
        addVideoStream(video, userVideoStream);
    })
    call.on('close', () =>{
        video.remove();
    })
    console.log(call);
    peers[userId] = call;
};

const connectToNewUserScreen = (userId, stream) =>{
    const call = peerServer.call(userId, stream);
    const screen = document.createElement('video');
    call.on('screen', userScreenStream =>{
        addScreenShot(screen, userScreenStream);
    })
    call.on('close', () =>{
        screen.remove();
    })
    console.log(call);
    peers[userId] = call;
};

// 영상에 매체와 실행을 맡는 함수
const addVideoStream = (video,stream) => {
        video.srcObject = stream;  
        video.addEventListener('loadedmetadata',() =>{
        video.play();
    });
    videoArea.append(video);
    };

// 화면공유를 실행할때 비디오로 나오게 해주는 함수
const addScreenShot = (video,kind) =>{
    video.srcObject = kind;
    video.addEventListener('loadedmetadata',() =>{
        video.play();
    });
    screenArea.append(video);
};


    function play() {
        var superBuffer = new Blob(recordedChunks);
        videoElement.src = window.URL.createObjectURL(superBuffer);
      };




