const initialState = {
  // file: null,
  manualSpool: [],
  internalSpool: [],
  currentLine: null,
}

const despool = (state) => {
  let spoolID
  if (internalSpool.length > 0) {
    spoolID = 'internalSpool'
  } else if(manualSpool.length > 0) {
    spoolID = 'manualSpool'
  } else {
    return {
      ...state,
      currentLine: null
    }
  }
  const spool = state[spoolID]
  const currentLine = spool[0]
  return {
    ...state,
    currentLine,
    [spoolID]: spool.slice(1)
  }
}

const spoolerReducer = (state = initialState, action) => {
  switch(action.type) {
    // case 'SPOOL_FILE':
    //   return {
    //     ...state,
    //     file: action.data
    //   }
    case 'SPOOL':
      const { spoolID } = action
      if (['manualSpool', 'internalSpool'].includes(spoolID) === false) {
        throw new Error('Invalid spoolID')
      }
      const nextState = {
        ...state,
        [spoolID]: [...state[spoolID], ...action.data]
      }
      if (state.currentLine == null) {
        return despool(nextState)
      } else {
        return nextState
      }
    case 'DESPOOL':
      return despool(state)
    default:
      return state
  }
}
