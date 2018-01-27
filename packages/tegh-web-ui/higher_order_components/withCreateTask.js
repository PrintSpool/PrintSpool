import { graphql } from 'react-apollo'
import gql from 'graphql-tag'

const createTask = gql`
  mutation createTask(
    $macro: String
    $args: JSON
    $fileName: String
    $gcode: [String]
  ) {
    createTask(
      printerID: "test_printer_id"
      macro: $macro
      args: $args
      fileName: $fileName
      gcode: $gcode
    ) {
      id
    }
  }
`

const withCreateTask = graphql(createTask, {
  props: ({ mutate }) => ({
    createTask: variables => mutate({ variables })
  })
})

export default withCreateTask
