import tql from 'typiql'
import snl from 'strip-newlines'
import GraphQLJSON from 'graphql-type-json'

import FileInputType from '../../util/FileInput.graphql.js'
import actionResolver from '../../util/actionResolver'
import spoolTask from '../actions/spoolTask'
import getTask from '../selectors/getTask'

import TaskGraphQL from '../types/Task.graphql.js'

const spoolCommandsGraphQL = () => ({
  type: tql`${TaskGraphQL}!`,
  description: snl`
    Spools a task to execute a GCode file. The file name MUST end in
    either \`.gcode\` or \`.ngc\`. Non-GCode file formats may be
    supported in the future and differentiated by different file extensions.
  `,

  resolve: actionResolver({
    actionCreator: spoolTask,
    selector: (state, action) => getTask(state)(action.payload.task.id),
  }),

  args: {
    printerID: {
      type: tql`ID!`,
    },
    file: {
      type: tql`${FileInputType}!`
    },
  },
})

export default spoolCommandsGraphQL
