const socket = io('/')
const videoGrid = document.getElementById("video-grid")
const screen = document.getElementById("screen")
const peer = new Peer()
let bool = true

const myVideo = document.createElement("video")     //비디오 태그 생성
myVideo.muted = true
const peers = {}    // 나간 카메라에 userId를 받아 저장
    

const  displayShow = () =>{
    if(bool === true){
    navigator.mediaDevices.getDisplayMedia({
        video : true
}).then(stream =>{
    const display = document.createElement('video')
    screenShot(display, stream)
})
}
} // 화면공유 시켜주는 함수

const screenShot = (video,kind) =>{
    video.srcObject = kind
    console.log(kind)
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