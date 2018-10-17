import { Record } from 'immutable'

import { SET_WEB_RTC_PEER } from '../actions/setWebRTCPeer'

const initialState = Record({
  peer: null,
})()

const webRTCReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_WEB_RTC_PEER: {
      return state.set('peer', action.payload.webRTCPeer)
    }
    default: {
      return state
    }
  }
}

export default webRTCReducer
