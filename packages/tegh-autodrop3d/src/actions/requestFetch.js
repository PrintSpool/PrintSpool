export const REQUEST_FETCH = 'autodrop3d/REQUEST_FETCH'

const requestFetch = json => ({
  type: REQUEST_FETCH,
  payload: json,
})

export default requestFetch
