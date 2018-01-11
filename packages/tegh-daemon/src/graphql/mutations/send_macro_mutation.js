import tql from 'typiql'
import GraphQLJSON from 'graphql-type-json'
import _ from 'lodash'

import PrinterType from '../types/printer_type'
import spoolAction from '../../actions/spool_action.js'

const sendMacroMutation = () => ({
  type: tql`${PrinterType}!`,
  args: {
    printerID: {
      type: tql`ID!`,
    },
    macro: {
      type: tql`String!`,
    },
    args: {
      type: tql`${GraphQLJSON}!`,
    },
  },
  resolve(_source, args, { store }) {
    const state = store.getState()
    if (args.printerID !== state.config.id) {
      throw new Error(`Printer ID ${args.id} does not exist`)
    }
    const macro = state.macros[args.macro]
    if (macro == null) {
      throw new Error(`Macro ${args.macro} does not exist`)
    }
    const gcode = macro.run(
      _.cloneDeep(args.args),
      _.cloneDeep(state.config),
    )
    store.dispatch(spoolAction({
      spoolName: 'manualSpool',
      data: gcode,
    }))
    return state
  },
})

export default sendMacroMutation
