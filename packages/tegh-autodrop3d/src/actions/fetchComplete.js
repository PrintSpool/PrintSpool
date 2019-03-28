export const FETCH_COMPLETE = 'autodrop3d/FETCH_COMPLETE'

const fetchComplete = responseText => ({
  type: FETCH_COMPLETE,
  payload: responseText,
})

export default fetchComplete
