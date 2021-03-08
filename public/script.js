const socket = io('/');
const videoArea = document.getElementById("video-grid");
const screenArea = document.getElementById("screen");
const peerServer = new Peer();
let shareScreenBool = true;

const myVideo = document.getElementById("myVideo");//자신의 웹캠 영성
const openCamBtn = document.getElementById("openCam")//버튼클릭시 캠활성화
const recordScreenArea = document.getElementById("recordVideo"); //비디오 태그 생성
const startRecordBtn = document.getElementById("startRecord");
const stopRecordBtn = document.getElementById("stopRecord");
myVideo.muted = true;
const peers = {};    // 나간 카메라에 userId를 받아 저장
    

// 캠 영상을 녹화하는 함수 호출
startRecordBtn.onclick =() =>{recordVideo(), recordScreen()};
    

const recordVideo = () =>{                                
    navigator.mediaDevices.getUserMedia({video:true, audio:false}).then(stream =>{
    const options =  { mimeType : 'video/webm; codecs=vp9 '};
    let SetRecorder = new MediaRecorder(stream, options);
    
    
        SetRecorder.start();
        console.log(SetRecorder);
    
        
    stopRecordBtn.onclick = () =>{
        SetRecorder.stop();
        console.log(SetRecorder);
        myVideo.stop()

        const handleVideoData = (e) => {
            // blob 이벤트에서 data 추출
            const { data } = e;
            console.log(data,e)
            // 다운로드를 위해 a 태그를 만들어주고 href로 해당 data를 다운로드 받을 수 있게 url을 만든다.
            const videoDownloadlink = document.createElement("a");
            videoDownloadlink.href = URL.createObjectURL(data);
            
            // 다운로드 되는 파일의 이름. 확장자는 mp4 등 다양하게 가능하지만 오픈 소스인지 확인 한다.
            videoDownloadlink.download = "recorded.webm";
            
            // body에 append 해줌.
            document.body.appendChild(videoDownloadlink);
            
            // faking click. body에 append 했으니 클릭해서 다운로드를 해줘야 한다.
            videoDownloadlink.click();
          };
          SetRecorder.addEventListener("dataavailable", handleVideoData);
    };
    }
    )};

//     //화면공유 녹화
//     const recordScreen = () =>{                                
//         navigator.mediaDevices.getDisplayMedia({video:true, audio:false}).then(stream =>{
//         const options =  { mimeType : 'video/webm; codecs=vp9 '};
//         let SetRecorder = new MediaRecorder(stream, options);
        
        
//             SetRecorder.start();
//             console.log(SetRecorder);
        
        
//         stopRecordBtn.onclick = () =>{
//             SetRecorder.stop();
//             console.log(SetRecorder);
    
    
//             const handleVideoData = (e) => {
//                 // blob 이벤트에서 data 추출
//                 const { data } = e;
//                 console.log(data,e)
//                 // 다운로드를 위해 a 태그를 만들어주고 href로 해당 data를 다운로드 받을 수 있게 url을 만든다.
//                 const videoDownloadlink = document.createElement("a");
//                 videoDownloadlink.href = URL.createObjectURL(data);
                
//                 // 다운로드 되는 파일의 이름. 확장자는 mp4 등 다양하게 가능하지만 오픈 소스인지 확인 한다.
//                 videoDownloadlink.download = "recorded.webm";
                
//                 // body에 append 해줌.
//                 document.body.appendChild(videoDownloadlink);
                
//                 // faking click. body에 append 했으니 클릭해서 다운로드를 해줘야 한다.
//                 videoDownloadlink.click();
//               };
//               SetRecorder.addEventListener("dataavailable", handleVideoData);
//         };
//     });
// }


// 화면공유 시켜주는 함수
const  displayShow = () =>{
    if(shareScreenBool === true){
        shareScreenBool = false
    navigator.mediaDevices.getDisplayMedia({
        video : true
}).then(stream =>{
    const display = document.createElement('video');
    AddScreenShot(display, stream);
});
}
}; 

// 화면공유를 실행할때 비디오로 나오게 해주는 함수
const AddScreenShot = (video,kind) =>{
    video.srcObject = kind;
    video.addEventListener('loadedmetadata',() =>{
        video.play();
        bool = false;
    });
    screenArea.append(video);
};

navigator.mediaDevices.getUserMedia({
    video : true
}).then(stream =>{ 

    openCamBtn.onclick = () =>{
    addVideoStream(myVideo, stream);
}

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
        connectToNewUser(userId, stream);
    });      
}); 

//상대방이 방에서 나갔을때 영상을 종료하는 소켓
socket.on("user-disconnected", userId =>{
    console.log(userId);
    if( peers[userId]) {peers[userId].close();}
});


//경로를 타고왔을때 받은 KEY와 id를 서버에 보냄
peerServer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id);
});

//자신이 방에 들어 왔을때 추가되는 태그와 영상
const connectToNewUser = (userId, stream) =>{
    const call = peerServer.call(userId, stream);
    const video = document.createElement('video');
    call.on('stream', userVideoStream =>{
        addVideoStream(video, userVideoStream);
    })
    call.on('close', () =>{
        video.remove();
    })

    peers[userId] = call;
};

//영상에 매체와 실행을 맡는 함수
const addVideoStream = (video,stream) => {
        video.srcObject = stream;  
        video.addEventListener('loadedmetadata',() =>{
        video.play();
    });
    videoArea.append(video);
    };


    function play() {
        var superBuffer = new Blob(recordedChunks);
        videoElement.src = window.URL.createObjectURL(superBuffer);
      };