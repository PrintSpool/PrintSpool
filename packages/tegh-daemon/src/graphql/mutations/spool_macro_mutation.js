import tql from 'typiql'
import GraphQLJSON from 'graphql-type-json'
import _ from 'lodash'

import TaskType from '../types/task_type'
import createSpoolAction from '../../actions/createSpoolAction.js'
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
    const action = createSpoolAction({
      internal: false,
      priority: macro.run.priority || 'normal',
      fileName: args.macro,
      data: gcode,
    })
    store.dispatch(action)
    return action.task
  },
})

export default spoolMacroMutation
