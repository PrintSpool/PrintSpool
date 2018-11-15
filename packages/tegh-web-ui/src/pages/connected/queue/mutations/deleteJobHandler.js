import { graphql } from 'react-apollo'
import gql from 'graphql-tag'

const deleteJobGraphQL = gql`
  mutation deleteJob($input: DeleteJobInput!) {
    deleteJob(input: $input) { id }
  }
`

const deleteJobHandler = graphql(deleteJobGraphQL, {
  props: ({ mutate }) => ({
    deleteJob: (job) => {
      mutate({
        variables: {
          input: {
            jobID: job.id,
          },
        },
      })
    },
  }),
})

export default deleteJobHandler
