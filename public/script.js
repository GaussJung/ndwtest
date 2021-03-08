const socket = io('/')
const videoGrid = document.getElementById("video-grid")
const screen = document.getElementById("screen")
const peer = new Peer()
let bool = true
let bools = true

const myVideo = document.getElementById("myVideo")   
const recordScreen = document.getElementById("recordVideo") //비디오 태그 생성
const startRecord = document.getElementById("startRecord")
const stopRecord = document.getElementById("stopRecord")
myVideo.muted = true
const peers = {}    // 나간 카메라에 userId를 받아 저장
    


const recordVideo = () =>{                                
    navigator.mediaDevices.getUserMedia({video:true, audio:false}).then(stream =>{
    const options =  {
      mimeType : 'video/webm; '
    }
    let Recorder = new MediaRecorder(stream, options)
    
    startRecord.onclick =() =>{
        Recorder.start()
        console.log(Recorder)
    }
    
    stopRecord.onclick = () =>{
        Recorder.stop()
        console.log(Recorder)
        const handleVideoData = (e) => {
            // blob 이벤트에서 data 추출
            const { data } = e;
            console.log(data,e)
            // 다운로드를 위해 a 태그를 만들어주고 href로 해당 data를 다운로드 받을 수 있게 url을 만듭시다
            const videoDownloadlink = document.createElement("a");
            videoDownloadlink.href = URL.createObjectURL(data);
            
            // 다운로드 되는 파일의 이름. 확장자는 mp4 등 다양하게 가능하지만 오픈 소스인지 확인 합시다
            link.download = "recorded.webm";
            
            // body에 append 해줘야겠죠
            document.body.appendChild(link);
            
            // faking click. body에 append 했으니 클릭해서 다운로드를 해줘야 합니다.
            link.click();
          };
          Recorder.addEventListener("dataavailable", handleVideoData);
    }
    })
}


const  displayShow = () =>{
    if(bool === true){
    navigator.mediaDevices.getDisplayMedia({
        video : true
}).then(stream =>{
    const display = document.createElement('video')
    screenShot(display, stream)
})
}else{
    bool = false
    display.destroy()
}
} // 화면공유 시켜주는 함수

const screenShot = (video,kind) =>{
    video.srcObject = kind
    video.addEventListener('loadedmetadata',() =>{
        video.play()
        bool = false;
    })
    screen.append(video)
}// 화면공유를 실행할때 비디오로 나오게 해주는 함수

navigator.mediaDevices.getUserMedia({
    video : true
}).then(stream =>{ 
    addVideoStream(myVideo, stream)

    peer.on('call', call =>{
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream=>{
            addVideoStream(video, userVideoStream)
        })
    }) //자신이 방에 들어 왔을때 추가되는 태그와 영상

    socket.on('user-connected', userId =>{
        connectToNewUser(userId, stream)
    })      //상대방이 들어왔을때 userId와 영상을 새로 생성 하는 소켓
}) 


socket.on("user-disconnected", userId =>{
    console.log(userId)
    if( peers[userId]) {peers[userId].close()}
})//상대방이 방에서 나갔을때 영상을 종료하는 소켓



peer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id)
})//경로를 타고왔을때 받은 KEY와 id를 서버에 보냄

const connectToNewUser = (userId, stream) =>{
    const call = peer.call(userId, stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream =>{
        addVideoStream(video, userVideoStream)
    })
    call.on('close', () =>{
        video.remove()
    })

    peers[userId] = call
}//자신이 방에 들어 왔을때 추가되는 태그와 영상


const addVideoStream = (video,stream) => {
        video.srcObject = stream  
        video.addEventListener('loadedmetadata',() =>{
        video.play()
    })
    videoGrid.append(video)
    }//영상에 매체와 실행을 맡는 함수


    function play() {
        var superBuffer = new Blob(recordedChunks);
        videoElement.src =
          window.URL.createObjectURL(superBuffer);
      }