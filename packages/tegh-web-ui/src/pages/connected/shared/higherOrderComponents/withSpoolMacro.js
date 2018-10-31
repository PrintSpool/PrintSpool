import { graphql } from 'react-apollo'
import gql from 'graphql-tag'

const spoolMacro = gql`
  mutation spoolMacro(
    $input: SpoolMacroInput!
  ) {
    spoolMacro(input: $input)
  }
`

const withSpoolMacro = graphql(spoolMacro, {
  props: ({ mutate }) => ({
    spoolMacro: ({ printerID, macro, args }) => mutate({
      variables: {
        input: {
          printerID,
          macro,
          args,
        },
      },
    }),
  }),
})

export default withSpoolMacro
