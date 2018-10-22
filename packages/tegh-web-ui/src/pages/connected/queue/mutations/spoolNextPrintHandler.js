import { List } from 'immutable'
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

    const jobFiles = List(ownProps.jobs)
      .map(job => List(job.files))
      .flatten()

    const nextJobFile = jobFiles.find(jobFile => jobFile.printsQueued > 0)

    const readyPrinter = ownProps.printers.find(printer => (
      printer.status === 'READY'
    ))

    return {
      nextJobFile,
      spoolNextPrint: () => {
        if (nextJobFile == null) {
          throw new Error('nothing in the queue to print')
        }
        if (readyPrinter == null) {
          throw new Error('No printer is ready to start a print')
        }

        mutate({
          variables: {
            input: {
              printerID: readyPrinter.id,
              jobFileID: nextJobFile.id,
            },
          },
        })
      },
    }
  },
})

export default spoolNextPrintHandler
