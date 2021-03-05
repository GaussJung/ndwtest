const socket = io('/')
const videoGrid = document.getElementById("video-grid")
const peer = new Peer(undefined, {
    host: '/',
    port: '3001'
})

const myVideo = document.createElement("video")
myVideo.muted = true
const peers = {}


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
    })

    socket.on('user-connected', userId =>{
        connectToNewUser(userId, stream)
    })
})


socket.on("user-disconnected", userId =>{
    console.log(userId)
    
    if( peers[userId]) {peers[userId].close()}
   
})



peer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id)
})

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
}


const addVideoStream = (video,stream) => {
        video.srcObject = stream
        console.log(video.srcObject.active);
    
        video.addEventListener('loadedmetadata',() =>{
        video.play()
    })
    videoGrid.append(video)
    }
    
    

      
    
