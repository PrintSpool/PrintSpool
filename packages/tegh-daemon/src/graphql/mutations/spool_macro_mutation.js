import tql from 'typiql'
import GraphQLJSON from 'graphql-type-json'
import _ from 'lodash'

import TaskType from '../types/task_type'
import spoolAction from '../../actions/spool_action.js'
import resetSpoolsAction from '../../actions/reset_spools_action.js'

const spoolMacroMutation = () => ({
  type: tql`${TaskType}!`,
  args: {
    printerID: {
      type: tql`ID!`,
    },
    macro: {
      type: tql`String!`,
    },
    args: {
      type: tql`${GraphQLJSON}`,
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
    const action = spoolAction({
      spoolName: 'manualSpool',
      fileName: args.macro,
      data: gcode,
    })
    if (macro.run.resetSpools) store.dispatch(resetSpoolsAction())
    store.dispatch(action)
    return action.task
  },
})

export default spoolMacroMutation
