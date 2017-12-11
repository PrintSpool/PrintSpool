// @flow

export type SpoolState = {
  +manualSpool: Array<String>,
  +internalSpool: Array<String>,
  +currentLine: ?String,
}

export type SpoolAction = {
  +type: 'SPOOL',
  +spoolID: 'manualSpool' | 'internalSpool',
  +data: Array<String>,
}

export type DespoolAction = {
  +type: 'DESPOOL',
}

const initialState: SpoolState = {
  // file: null,
  manualSpool: [],
  internalSpool: [],
  currentLine: null,
}

const despool = (state: SpoolState) => {
  const { internalSpool, manualSpool } = state
  let spoolID
  if (internalSpool.length > 0) {
    spoolID = 'internalSpool'
  } else if (manualSpool.length > 0) {
    spoolID = 'manualSpool'
  } else {
    return {
      ...state,
      currentLine: null,
    }
  }
  const spool = state[spoolID]
  const currentLine = spool[0]
  return {
    ...state,
    currentLine,
    [spoolID]: spool.slice(1),
  }
}

const spoolReducer = (
  state: SpoolState = initialState,
  action: SpoolAction | DespoolAction,
) => {
  switch (action.type) {
    // case 'SPOOL_FILE':
    //   return {
    //     ...state,
    //     file: action.data
    //   }
    case 'SPOOL': {
      const { spoolID } = action
      if (['manualSpool', 'internalSpool'].includes(spoolID) === false) {
        throw new Error('Invalid spoolID')
      }
      const nextState = {
        ...state,
        [spoolID]: [...state[spoolID], ...action.data],
      }
      if (state.currentLine == null) {
        return despool(nextState)
      }
      return nextState
    }
    case 'DESPOOL':
      return despool(state)
    default:
      return state
  }
}

export default spoolReducer
