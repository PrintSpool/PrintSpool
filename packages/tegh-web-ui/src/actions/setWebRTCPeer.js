export const SET_WEB_RTC_PEER = 'tegh-web/SET_WEB_RTC_PEER'

const setWebRTCPeer = webRTCPeer => ({
  type: SET_WEB_RTC_PEER,
  payload: {
    webRTCPeer,
  },
})

export default setWebRTCPeer
