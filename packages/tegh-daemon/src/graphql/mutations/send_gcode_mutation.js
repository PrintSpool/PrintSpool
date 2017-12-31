import tql from 'typiql'
import PrinterType from '../types/printer_type'
import normalizeGCodeLines from '../../helpers/normalize_gcode_lines'

const sendGCodeMutation = () => ({
  type: tql`${PrinterType}!`,
  args: {
    printerID: {
      type: tql`ID!`,
    },
    gcode: {
      type: tql`[String!]!`,
    },
  },
  resolve(_source, args, { store }) {
    const state = store.getState()
    if (args.printerID !== state.config.id) {
      throw new Error(`Printer ID ${args.id} does not exist`)
    }
    store.dispatch({
      type: 'SPOOL',
      spoolID: 'manualSpool',
      data: normalizeGCodeLines(args.gcode),
    })
    return state
  },
})

export default sendGCodeMutation
