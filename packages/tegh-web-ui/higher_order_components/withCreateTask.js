import { graphql } from 'react-apollo'
import gql from 'graphql-tag'

const createTask = gql`
  mutation createTask($macro: String!, $args: JSON) {
    spoolMacro(printerID: "test_printer_id", macro: $macro, args: $args) {
      id
    }
  }
`

const withCreateTask = graphql(createTask, {
  props: ({ mutate }) => ({
    createTask: ({ macro, args }) => mutate({
      variables: { macro, args },
    })
  })
})

export default withCreateTask
