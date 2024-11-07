const startButton = document.getElementById("startButton");
const stopButton = document.getElementById("stopButton");
const localVideo = document.getElementById("localVideo");

let localStream;
let peerConnection;
const signalingServerUrl = 'ws://localhost:8080'; // URL do servidor de sinalização
const signalingServer = new WebSocket(signalingServerUrl);

// Configurações do STUN server (essencial para conexão P2P)
const configuration = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
};

// Manipula mensagens de sinalização
signalingServer.onmessage = async (message) => {
    const data = JSON.parse(message.data);

    if (data.offer) {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        signalingServer.send(JSON.stringify({ answer }));
    } else if (data.answer) {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
    } else if (data.candidate) {
        await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
    }
};

// Inicializa a conexão WebRTC e vídeo local
async function startVideoCall() {
    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localVideo.srcObject = localStream;

    peerConnection = new RTCPeerConnection(configuration);

    // Adiciona o fluxo local ao peerConnection
    localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

    // Configura ICE candidate handling
    peerConnection.onicecandidate = ({ candidate }) => {
        if (candidate) {
            signalingServer.send(JSON.stringify({ candidate }));
        }
    };

    // Exibe o vídeo remoto quando o stream remoto é adicionado
    peerConnection.ontrack = (event) => {
        const [remoteStream] = event.streams;
        remoteVideo.srcObject = remoteStream;
    };

    // Inicia a chamada com uma oferta
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    signalingServer.send(JSON.stringify({ offer }));
}

startButton.addEventListener("click", startVideoCall);

stopButton.addEventListener("click", () => {
    // Encerra o stream local e a conexão
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        localVideo.srcObject = null;
    }
    if (peerConnection) {
        peerConnection.close();
    }
});
