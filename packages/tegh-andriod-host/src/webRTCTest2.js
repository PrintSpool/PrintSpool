import {
  RTCPeerConnection,
  RTCMediaStream,
  RTCIceCandidate,
  RTCSessionDescription,
  RTCView,
  MediaStreamTrack,
  getUserMedia,
} from 'react-native-webrtc'


const localConnection = new RTCPeerConnection();

const sendChannel = localConnection.createDataChannel("sendChannel");
sendChannel.onopen = handleSendChannelStatusChange;
sendChannel.onclose = handleSendChannelStatusChange;

remoteConnection = new RTCPeerConnection();
remoteConnection.ondatachannel = receiveChannelCallback;


localConnection.onicecandidate = e => !e.candidate
        || remoteConnection.addIceCandidate(e.candidate)
        .catch(handleAddCandidateError);

remoteConnection.onicecandidate = e => !e.candidate
    || localConnection.addIceCandidate(e.candidate)
    .catch(handleAddCandidateError);

localConnection.createOffer()
    .then(offer => localConnection.setLocalDescription(offer))
    .then(() => remoteConnection.setRemoteDescription(localConnection.localDescription))
    .then(() => remoteConnection.createAnswer())
    .then(answer => remoteConnection.setLocalDescription(answer))
    .then(() => localConnection.setRemoteDescription(remoteConnection.localDescription))
    .catch(handleCreateDescriptionError);
