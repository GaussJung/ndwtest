const socket = io('/');
const videoArea = document.getElementById("video-grid");
const screenArea = document.getElementById("screen");
const peerServer = new Peer();
let recordVideoBool = true
let shareScreenBool = true;

const myVideo = document.getElementById("myVideo");//자신의 웹캠 영성
const myScreen = document.getElementById("myScreen")
const BtnstartRecord = document.getElementById("startRecordVideo");
const BtnstopRecord = document.getElementById("stopRecordVideo");
const BtnstartRecordScreen = document.getElementById("startRecordScreen");
const BtnstopRecordScreen = document.getElementById("stopRecordScreen");
myVideo.muted = true;
const peers = {};    // 나간 카메라에 userId를 받아 저장
    

// 캠 영상을 녹화하는 함수 호출
BtnstartRecord.onclick =() =>{recordVideo()};
BtnstartRecordScreen.onclick = () =>{shareScreen()};
    

const recordVideo = () =>{      
    if(recordVideoBool){                          
    navigator.mediaDevices.getUserMedia({video:true, audio:false}).then(stream =>{
    const options =  { mimeType : 'video/webm; codecs=vp9 '};
    let SetRecorder = new MediaRecorder(stream, options);
    
    recordVideoBool = false;
        SetRecorder.start();
        console.log(SetRecorder);
    
        
        BtnstopRecord.onclick = () =>{
        SetRecorder.stop();
        console.log(SetRecorder);
        
        
        const handleVideoData = (e) => {
            //로컬저장
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

            //         // 서버저장
            //         let formdata = new FormData();
            // formdata.append("fname", "audio.webm");
            // formdata.append("data", blob);

            // let xhr = new XMLHttpRequest();
            // xhr.open("POST", "/upload", false);
            // xhr.send(formdata);
          };
          
          
          SetRecorder.addEventListener("dataavailable", handleVideoData);
    };
    }
    )};
}



// 웹캠화면 출력
    navigator.mediaDevices.getUserMedia({
        video : true
    }).then(stream =>{ 
    
        
        addVideoStream(myVideo, stream);
    
    
    //자신이 방에 들어 왔을때 추가되는 태그와 영상
        peerServer.on('call', call =>{
            call.answer(stream);
           
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
    const options =  { mimeType : 'video/webm; codecs=vp9 '};
    let SetScreenRecorder = new MediaRecorder(stream, options);
    shareScreenBool = false;

    // 화면공유 시켜주는 명령어
    const display = document.createElement('video')
    addScreenShot(display, stream);
    
    //자신이 방에 들어 왔을때 추가되는 태그와 영상
    peerServer.on('call', call =>{
        call.answer(stream);
        const screen = document.createElement('video');
        
    }); 

    //상대방이 들어왔을때 userId와 영상을 새로 생성 하는 소켓
    socket.on('user-connected', userId =>{
        connectToNewUserScreen(userId, stream);
    });

        SetScreenRecorder.start();
        console.log(SetScreenRecorder);

        

        //화면녹화를 끝내고 저장시키는 이벤트
        BtnstopRecordScreen.onclick = () =>{
        SetScreenRecorder.stop();
        console.log(SetScreenRecorder);


        const handleVideoData = (e) => {
            // blob 이벤트에서 data 추출
            const { data } = e;
            console.log(data,e)
            // 다운로드를 위해 a 태그를 만들어주고 href로 해당 data를 다운로드 받을 수 있게 url을 만든다.
            const videoDownloadlink = document.createElement("a");
            videoDownloadlink.href = URL.createObjectURL(data);
            
            // 다운로드 되는 파일의 이름. 확장자는 mp4 등 다양하게 가능하지만 오픈 소스인지 확인 한다.
            videoDownloadlink.download = "screenRecord.webm";
            
            // body에 append 해줌.
            document.body.appendChild(videoDownloadlink);
            
            // faking click. body에 append 했으니 클릭해서 다운로드를 해줘야 한다.
            videoDownloadlink.click();
          };
          SetScreenRecorder.addEventListener("dataavailable", handleVideoData);
        };
    });
};
}
// 상대방이 방에서 나갔을때 영상을 종료하는 소켓
socket.on("user-disconnected", userId =>{
    
    if( peers[userId]) {peers[userId].close();}
});


// 경로를 타고왔을때 받은 KEY와 id를 서버에 보냄
peerServer.on('open', id => {
    socket.emit("join-room", 0904,id)
});

// 자신이 방에 들어 왔을때 추가되는 태그와 영상
const connectToNewUserVideo = (userId, stream) =>{
    const call = peerServer.call(userId, stream);
    const video = document.createElement('video');
    console.log(call);
    peers[userId] = call;
};

const connectToNewUserScreen = (userId) =>{
    const call = peerServer.call(userId);
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
