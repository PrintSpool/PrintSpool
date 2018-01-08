import tql from 'typiql'
import PrinterType from '../types/printer_type'
import normalizeGCodeLines from '../../helpers/normalize_gcode_lines'
import GraphQLJSON from 'graphql-type-json'
import _ from 'lodash'

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
      type tql`${GraphQLJSON}!`,
    },
  },
  resolve(_source, args, { store }) {
    const state = store.getState()
    if (args.printerID !== state.config.id) {
      throw new Error(`Printer ID ${args.id} does not exist`)
    }
    const macro = state.macros[args.macro](
      _.cloneDeep(args),
      _.cloneDeep(state.config),
    )
    const gcode = macro(args)
    store.dispatch({
      type: 'SPOOL',
      spoolID: 'manualSpool',
      data: normalizeGCodeLines(gcode),
    })
    return state
  },
})

export default sendMacroMutation
