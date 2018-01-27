import tql from 'typiql'
import GraphQLJSON from 'graphql-type-json'
import _ from 'lodash'

import TaskType from '../types/task_type'
import createSpoolAction from '../../actions/createSpoolAction.js'
import resetSpoolsAction from '../../actions/reset_spools_action.js'

const createTaskMutation = () => ({
  type: tql`${TaskType}!`,
  args: {
    printerID: {
      type: tql`ID!`,
    },
    macro: {
      type: tql`String`,
    },
    args: {
      type: tql`${GraphQLJSON}`,
    },
    fileName: {
      type: tql`String`,
    },
    gcode: {
      type: tql`[String]`,
    },
  },
  resolve(_source, args, { store }) {
    const state = store.getState()
    if (args.printerID !== state.config.id) {
      throw new Error(`Printer ID ${args.id} does not exist`)
    }
    if (args.macro != null) {
      const macro = state.macros[args.macro]
      if (macro == null) {
        throw new Error(`Macro ${args.macro} does not exist`)
      }
      const gcode = macro.run(
        _.cloneDeep(args.args),
        _.cloneDeep(state.config),
      )
      const priority = macro.run.priority || 'normal'
      if (state.driver.status !== 'ready' && priority !== 'emergency') {
        throw new Error('Machine is not ready')
      }
      const action = createSpoolAction({
        internal: false,
        priority,
        fileName: args.macro,
        data: gcode,
      })
      store.dispatch(action)
      return action.task
    } else if(args.gcode != null) {
      const { fileName, gcode } = args
      if (fileName == null) {
        throw new Error(`fileName cannot be null for gcode uploads`)
      }
      const action = createSpoolAction({
        internal: false,
        priority: 'normal',
        fileName,
        data: gcode,
      })
      store.dispatch(action)
      return action.task
    }
  },
})

export default createTaskMutation
