import { graphql } from 'react-apollo'
import gql from 'graphql-tag'

const spoolJobFileGraphQL = gql`
  mutation spoolJobFile($input: SpoolJobFileInput!) {
    spoolJobFile(input: $input) { id }
  }
`

const spoolNextPrintHandler = graphql(spoolJobFileGraphQL, {
  props: ({ mutate, ownProps }) => {
    if (ownProps.loading || ownProps.error) return {}

    const jobFiles = ownProps.jobs
      .map(job => job.files)
      .flat()

    const nextJobFile = jobFiles.find(jobFile => jobFile.printsQueued > 0)

    const readyMachine = ownProps.machines.find(machine => (
      machine.status === 'READY'
    ))

    return {
      nextJobFile,
      spoolNextPrint: () => {
        if (nextJobFile == null) {
          throw new Error('nothing in the queue to print')
        }
        if (readyMachine == null) {
          throw new Error('No machine is ready to start a print')
        }

        mutate({
          variables: {
            input: {
              machineID: readyMachine.id,
              jobFileID: nextJobFile.id,
            },
          },
        })
      },
    }
  },
})

export default spoolNextPrintHandler
