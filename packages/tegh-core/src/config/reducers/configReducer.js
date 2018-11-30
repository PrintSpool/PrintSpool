import { loop, Cmd } from 'redux-loop'
import immutablePatch from 'immutablepatch'

import { SET_CONFIG } from '../actions/setConfig'
import requestSetConfig from '../actions/requestSetConfig'
import saveConfig from '../sideEffects/saveConfig'
import { REQUEST_PATCH_PRINTER_CONFIG } from '../actions/requestPatchPrinterConfig'

export const initialState = null

const configReducer = (state = initialState, action) => {
  switch (action.type) {
    case REQUEST_PATCH_PRINTER_CONFIG: {
      const { patch } = action.payload

      const config = state.set('printer', immutablePatch(state.printer, patch))

      return loop(
        state,
        Cmd.action(requestSetConfig({ config })),
      )
    }
    case SET_CONFIG: {
      const { config } = action.payload

      // If the config is being changed by a user then save it to disk.
      if (state != null) {
        return loop(
          config,
          Cmd.run(saveConfig, {
            args: [{ config }],
          }),
        )
      }

      return config
    }
    default: {
      return state
    }
  }
}

export default configReducer
