import { graphql } from 'react-apollo'
import gql from 'graphql-tag'

const spoolMacro = gql`
  mutation spoolMacro(
    $macro: String
    $args: JSON
  ) {
    spoolMacro(
      printerID: "test_printer_id"
      macro: $macro
      args: $args
    ) {
      id
    }
  }
`

const withSpoolMacro = graphql(spoolMacro, {
  props: ({ mutate }) => ({
    spoolMacro: variables => mutate({ variables })
  })
})

export default withSpoolMacro
