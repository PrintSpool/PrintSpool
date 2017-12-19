// @flow
import normalizeGCodeLines from '../helpers/normalize_gcode_lines'

export type SpoolState = {
  +manualSpool: Array<string>,
  +internalSpool: Array<string>,
  +currentLine: ?string,
  +sendSpooledLineToPrinter: boolean,
}

export type SpoolAction = {
  +type: 'SPOOL',
  +spoolID: 'manualSpool' | 'internalSpool',
  +data: Array<string>,
}

export type DespoolAction = {
  +type: 'DESPOOL',
}

const initialState: SpoolState = {
  // file: null,
  manualSpool: [],
  internalSpool: [],
  currentLine: null,
  sendSpooledLineToPrinter: false,
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
        sendSpooledLineToPrinter: false,
        [spoolID]: [...state[spoolID], ...normalizeGCodeLines(action.data)],
      }
      if (state.currentLine == null) {
        // recurse into the reducer to despool the first line
        return {
          ...spoolReducer(nextState, { type: 'DESPOOL' }),
          sendSpooledLineToPrinter: true,
        }
      }
      return nextState
    }
    case 'DESPOOL': {
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
    default:
      return state
  }
}

export default spoolReducer
