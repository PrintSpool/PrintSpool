import tql from 'typiql'
import PrinterType from '../types/printer_type'

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
  resolve(source, args, { store }) {
    if (args.id !== source.config.id) {
      throw new Error(`Printer ID ${args.id} does not exist`)
    }
    store.dispatch({
      type: 'SPOOL',
      spoolID: 'manualSpool',
      data: args.gcode,
    })
    return source
  },
})

export default sendGCodeMutation
