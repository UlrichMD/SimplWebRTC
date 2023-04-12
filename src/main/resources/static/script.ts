console.log("test")

// Connect to WebSocket
var signalServer:WebSocket = new WebSocket('ws://localhost:8080/webSocket');

var peerConnection:RTCPeerConnection;

const constraints = { audio: true, video: true };
const selfVideo:HTMLMediaElement|null = document.querySelector('#selfview');
const remoteVideo:HTMLMediaElement|null = document.querySelector('remoteview');


//Open Connection
signalServer.onopen = () => {
	initConnection();
}

function initConnection() {
	try {
		peerConnection = new RTCPeerConnection();
	    setUpStream();
    } catch (err) {
    	console.error(err);
    }
}

async function setUpStream(){
	const stream = await navigator.mediaDevices.getUserMedia(constraints);
	
	for (const track of stream.getTracks()) {
	   peerConnection.addTrack(track, stream);
	}
    if (selfVideo) {
		selfVideo.srcObject = stream;
	}
}

//PeerConnection Handler 

