import { Map } from 'immutable'

import { SET_LIVE_SUBSCRIPTION_STATE } from '../actions/setLiveSubscriptionState'

const initialState = Map({})

const liveSubscriptionReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_LIVE_SUBSCRIPTION_STATE: {
      return state.set(action.payload.key, action.payload.state)
    }
    default: {
      return state
    }
  }
}

export default liveSubscriptionReducer
