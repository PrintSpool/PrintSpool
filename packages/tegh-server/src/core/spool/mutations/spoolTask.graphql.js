import tql from 'typiql'
import GraphQLJSON from 'graphql-type-json'

import FileInputType from '../../util/FileInput.graphql.js'
import actionResolver from '../../util/actionResolver'
import spoolTask from './spoolTask'

// spoolTask(printerID: $printerID, macro: { name: 'move', args: {x: 10, y:20} } )
// spoolTask(printerID: $printerID, file: { name: 'test.ngc', content: 'g1 x10\n'} } )
// spoolTask(printerID: $printerID, id: 'a123b-ccc-1234bb' } )

const spoolTaskGraphQL = () => ({
  type: tql`${TaskType}!`,

  resolve: actionResolver({
    actionCreator: spoolTask,
    selector: (state, action) => (
      state.spool.allTasks[action.payload.id]
    ),
  }),

  args: {
    printerID: {
      type: tql`ID!`,
    },
    id: {
      type: tql`ID`,
    }
    file: {
      type: tql`${FileInputType}`
    },
    macro: {
      type: new GraphQLInputObjectType({
        name: 'SpoolMacroInput'
        fields: {
          name: {
            type: tql`String`,
          },
          args: {
            type: tql`${GraphQLJSON}`,
          },
        },
      }),
    },
  },
})

export default spoolTaskGraphQL
