const sendMessageToDatPeer = ({ peers, peerID, message }) => {
  const peer = peers.get(peerID)
  peer.send(message)
}

export default sendMessageToDatPeer
