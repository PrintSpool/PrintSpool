import { graphql } from 'react-apollo'
import gql from 'graphql-tag'

const spoolMacro = gql`
  mutation spoolMacro(
    $input: ExecGCodesInput!
  ) {
    execGCodes(input: $input) { id }
  }
`

const withSpoolMacro = graphql(spoolMacro, {
  props: ({ mutate }) => ({
    spoolMacro: ({ printerID, macro, args }) => mutate({
      variables: {
        input: {
          printerID,
          gcodes: [
            { [macro]: args },
          ],
        },
      },
    }),
  }),
})

export default withSpoolMacro
