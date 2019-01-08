const webRTCUpgradeMessage = ({
  sdp,
  protocol,
}) => ({
  connection: 'upgrade',
  upgrade: `webrtc-chunk-${protocol}`,
  sdp,
})

export default webRTCUpgradeMessage
