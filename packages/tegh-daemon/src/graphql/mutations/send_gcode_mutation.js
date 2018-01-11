import tql from 'typiql'

import TaskType from '../types/task_type'
import spoolAction from '../../actions/spool_action.js'

const sendGCodeMutation = () => ({
  type: tql`${TaskType}!`,
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
    const action = spoolAction({
      spoolName: 'manualSpool',
      data: args.gcode,
    })
    store.dispatch(action)
    return action.task
  },
})

export default sendGCodeMutation
