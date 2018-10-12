import _ from 'lodash'

import { graphql } from 'react-apollo'
import gql from 'graphql-tag'

const spoolJobFileGraphQL = gql`
  mutation spoolJobFile($input: SpoolJobFileInput!) {
    spoolJobFile(input: $input) {
      id
    }
  }
`

const spoolNextPrintHandler = graphql(spoolJobFileGraphQL, {
  props: ({ mutate, ownProps }) => {
    if (ownProps.loading || ownProps.error) return {}

    const jobFiles = _.flatten(ownProps.jobs.map(job => job.files))

    const nextJobFile = jobFiles.find(jobFile => jobFile.status === 'QUEUED')

    return {
      nextJobFile,
      spoolNextPrint: () => {
        if (nextJobFile == null) {
          throw new Error('nothing in the queue to print')
        }
        mutate({
          variables: {
            input: {
              printerID: ownProps.printerID,
              jobFileID: nextJobFile.id,
            },
          },
        })
      },
    }
  },
})

export default spoolNextPrintHandler
