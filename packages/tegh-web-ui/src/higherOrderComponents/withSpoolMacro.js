import { graphql } from 'react-apollo'
import gql from 'graphql-tag'

const spoolMacro = gql`
  mutation spoolMacro(
    $input: SpoolMacroInput!
  ) {
    spoolMacro(input: $input) {
      id
    }
  }
`

const withSpoolMacro = graphql(spoolMacro, {
  props: ({ mutate }) => ({
    spoolMacro: input => mutate({
      variables: {
        input: {
          printerID: 'test_printer_id',
          ...input,
        },
      },
    }),
  }),
})

export default withSpoolMacro
