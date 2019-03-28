export const FETCH_FAIL = 'autodrop3d/FETCH_FAIL'

const fetchFail = e => ({
  type: FETCH_FAIL,
  payload: {
    error: e,
  },
})

export default fetchFail
