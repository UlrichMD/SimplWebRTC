console.log("TestScript");

console.log("test")

// Connect to WebSocket
var signalServer = new WebSocket('ws://localhost:8080/webSocket');

var peerConnection;

const constraints = { audio: true, video: true };
const selfVideo = document.querySelector('#selfview');
const remoteVideo = document.querySelector('#remoteview');


//Open Connection
signalServer.onopen = () => {
	initConnection();
}

function initConnection() {
	try {
		console.log('Init')
		peerConnection = new RTCPeerConnection();
	    setUpStream();
	    //PeerConnection Handler 
		peerConnection.onnegotiationneeded = async () => {
		  try {
			console.log('onnegatiationneeded');
			await peerConnection.createOffer().then((offer) => {
				console.log('offer '+ offer);
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
		    console.log("set remote string");
		    remoteVideo.srcObject = streams[0];
		  };
		};
		peerConnection.onicecandidate = ({ candidate }) => {
			console.log("Candidate");
			if (candidate) {				
				signalServer.send(JSON.stringify(candidate));
			}
			};
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

signalServer.onmessage = async (msg) => {
    //console.log("Got message", msg.data);
    var signal = JSON.parse(msg.data);
    if (signal.type) {	
		console.log("description");
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
        	await peerConnection.addIceCandidate(new RTCIceCandidate(signal));
      	} catch (err) {
	        //if (!ignoreOffer) {
	          throw err; }
        //}
	}
};
