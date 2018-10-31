import tql from 'typiql'
import snl from 'strip-newlines'
import { GraphQLInputObjectType } from 'graphql'

import FileInputType from '../../util/FileInput.graphql'
import actionResolver from '../../util/actionResolver'
import spoolTask from '../actions/spoolTask'

import TaskGraphQL from '../types/Task.graphql'

const SpoolCommandsInputGraphQL = new GraphQLInputObjectType({
  name: 'SpoolCommandsInput',
  fields: {
    printerID: {
      type: tql`ID!`,
    },
    file: {
      type: tql`${FileInputType}!`,
    },
  },
})


const spoolCommandsGraphQL = () => ({
  type: tql`${TaskGraphQL}!`,
  description: snl`
    Spools a task to execute a GCode file. The file name MUST end in
    either \`.gcode\` or \`.ngc\`. Non-GCode file formats may be
    supported in the future and differentiated by different file extensions.
  `,

  resolve: actionResolver({
    actionCreator: spoolTask,
    selector: (state, action) => action.payload.task,
  }),

  args: {
    input: {
      type: tql`${SpoolCommandsInputGraphQL}!`,
    },
  },
})

export default spoolCommandsGraphQL
