import { graphql } from 'react-apollo'
import gql from 'graphql-tag'

const deleteJobGraphQL = gql`
  mutation deleteJob($input: DeleteJobInput!) {
    deleteJob(input: $input)
  }
`

const deleteJobHandler = graphql(deleteJobGraphQL, {
  props: ({ mutate }) => ({
    deleteJob: ({ jobID }) => {
      mutate({
        variables: {
          input: {
            jobID,
          },
        },
      })
    },
  }),
})

export default deleteJobHandler
