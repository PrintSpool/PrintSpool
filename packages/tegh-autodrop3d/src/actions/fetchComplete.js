export const FETCH_COMPLETE = 'autodrop3d/FETCH_COMPLETE'

const fetchComplete = json => ({
  type: FETCH_COMPLETE,
  payload: json,
})

export default fetchComplete
