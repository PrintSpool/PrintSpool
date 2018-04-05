import _ from 'lodash'

import { graphql } from 'react-apollo'
import gql from 'graphql-tag'

const cancelTaskGraphQL = gql`
  mutation cancelTask($input: CancelTaskInput!) {
    cancelTask(input: $input) {
      id
    }
  }
`

const cancelTaskHandler = graphql(cancelTaskGraphQL, {
  props: ({ mutate, ownProps }) => {
    return {
      cancelTask: task => {
        mutate({
          variables: {
            input: {
              printerID: task.printer.id,
              taskID: task.id,
            },
          },
        })
      },
    }
  },
})

export default cancelTaskHandler
