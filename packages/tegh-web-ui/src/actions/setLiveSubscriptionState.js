export const SET_LIVE_SUBSCRIPTION_STATE = '/tegh-web-ui/SET_LIVE_SUBSCRIPTION_STATE'

const setLiveSubscriptionState = ({ key, state }) => ({
  type: SET_LIVE_SUBSCRIPTION_STATE,
  payload: {
    key,
    state,
  },
})

export default setLiveSubscriptionState
