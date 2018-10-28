import { graphql } from 'react-apollo'
import gql from 'graphql-tag'

import fastJsonPatch from 'fast-json-patch'

const patchConfigGraphQL = gql`
  mutation patchConfig($input: PatchConfigInput!) {
    patchConfig(input: $input)
  }
`

const patchConfigMutation = graphql(patchConfigGraphQL, {
  props: ({ mutate, ownProps }) => {
    const patchConfig = ({ patch }) => {
      mutate({
        variables: {
          input: {
            printerID: ownProps.match.printerID,
            patch,
          },
        },
      })
    }

    return {
      patchConfig,
      updateSubConfig: (nextConfig) => {
        // TODO: patch generation
        const patch = fastJsonPatch.compare(ownProps.config, nextConfig)
        patchConfig({ patch })
      },
      addSubConfig: ({ path, value }) => {
        const patch = {
          op: 'add',
          path,
          value,
        }
        patchConfig({ patch })
      },
    }
  },
})

export default patchConfigMutation
