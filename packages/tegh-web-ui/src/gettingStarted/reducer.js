// import loadLocalStorageJSON from '../sideEffects/loadLocalStorageJSON'

export const init = () => ({
  step: 0,
  // TODO: do we need a persistent identity here?
  // myIdentity: loadLocalStorageJSON('myIdentity'),
  invite: null,
})

const reducer = (state, action) => {
  switch (action.type) {
    case 'next':
    case 'back': {
      return {
        ...state,
        step: state.step + (action.type === 'next' ? 1 : -1),
      }
    }
    case 'submitInvite': {
      const { invite } = action.payload
      console.log('Invite Submitted', invite)

      return {
        ...state,
        step: state.step + 1,
        invite,
      }
    }
    default: {
      throw new Error()
    }
  }
}

export default reducer
