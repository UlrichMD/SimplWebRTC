// Connect to WebSocket
var signalServer = new WebSocket('ws://localhost:8080/webSocket');

var peerConnection;

const constraints = { audio: true, video: true };
const selfVideo = document.querySelector('#selfview');
const remoteVideo = document.querySelector('#remoteview');

const micControl = document.getElementById('micControl');
const cameraControl = document.getElementById('cameraControl');
const endcall = document.getElementById('endcall');

var stream;


//Open Connection
signalServer.onopen = () => {
	initConnection();
}

function initConnection() {
	try {
		// Using free public google STUN server.
	    const configuration = {
	        iceServers: [{
	            urls: 'stun:stun.l.google.com:19302'
	        }]
	    };
	    
		peerConnection = new RTCPeerConnection(configuration);
	    setUpStream();
	    //PeerConnection Handler 
		peerConnection.onnegotiationneeded = async () => {
		  try {
			await peerConnection.createOffer().then((offer) => {
				peerConnection.setLocalDescription(offer);
				signalServer.send(JSON.stringify(offer));
			});
		  } catch (err) {
			console.log("negotiation error");
		    console.error(err);
		  }
		}
		peerConnection.ontrack = ({ track, streams }) => {
		  console.log('ontrack');
		  track.onunmute = () => {
		    if (remoteVideo.srcObject) {
		      return;
		    }
		    remoteVideo.srcObject = streams[0];
		  };
		};
		peerConnection.onicecandidate = ({ candidate }) => {
			if (candidate) {				
				signalServer.send(JSON.stringify(candidate));
			}
			};
    } catch (err) {
    	console.error(err);
    }
}

async function setUpStream(){
	stream = await navigator.mediaDevices.getUserMedia(constraints);
	
	for (const track of stream.getTracks()) {
	   peerConnection.addTrack(track, stream);
	}
    if (selfVideo) {
		selfVideo.srcObject = stream;
	}
}

signalServer.onmessage = async (msg) => {
    //console.log("Got message", msg.data);
    var signal = JSON.parse(msg.data);
    if (signal.type) {
	    switch (signal.type) {
	        case "offer":
				console.log("receiced offer");
				peerConnection.setRemoteDescription(new RTCSessionDescription(signal));
	            await peerConnection.createAnswer().then((answer) => {
					signalServer.send(JSON.stringify(answer));
					peerConnection.setLocalDescription(answer);
				})
	            break;
	        case "answer":
				console.log("receiced answer");
	            peerConnection.setRemoteDescription(new RTCSessionDescription(signal));
	        	console.log("connection established successfully!!");
	            break;
	        // In local network, ICE candidates might not be generated.
	        default:
	            break;
	    }
	}
	if (signal.candidate) {
		try {
			console.log("receiced candidate");
        	await peerConnection.addIceCandidate(new RTCIceCandidate(signal));
      	} catch (err) {
	        //if (!ignoreOffer) {
	          throw err; }
        //}
	}
};


micControl.addEventListener("click", () => {
	stream.getAudioTracks()[0].enabled = !stream.getAudioTracks()[0].enabled;
	stream.getAudioTracks()[0].enabled ? micControl.style.opacity = 1 : micControl.style.opacity = 0.5;
})

cameraControl.addEventListener("click", () => {
	stream.getVideoTracks()[0].enabled = !stream.getVideoTracks()[0].enabled;
	stream.getVideoTracks()[0].enabled ? cameraControl.style.opacity = 1 : cameraControl.style.opacity = 0.5;
})

endcall.addEventListener("click", () => {
	peerConnection.close();
    signalServer.close();
    window.location.href = './bye.html';
})