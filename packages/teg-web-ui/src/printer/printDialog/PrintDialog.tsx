import React, { useCallback, useState } from 'react'
import { gql } from '@apollo/client'
import { useAsync } from 'react-async'
import { useMutation } from '@apollo/client'

import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import DialogActions from '@material-ui/core/DialogActions'

import PrintDialogContent from './PrintDialogContent'
import useCreateJobMutation from './useCreateJobMutation'
// import useLiveSubscription from '../_hooks/useLiveSubscription'

// const PRINT_DIALOG_QUERY = gql`
//   fragment QueryFragment on Query {
//     machines {
//       id
//       name
//       status
//     }
//   }
// `

const PRINT_MUTATION = gql`
  mutation print($input: PrintInput!) {
    print(input: $input) { id }
  }
`

const PrintDialog = ({
  printQueues,
  machines,
  files,
  onClose,
}) => {
  const printQueueID = printQueues[0].id
  // const subscription = useLiveSubscription(PRINT_DIALOG_QUERY)
  const [ createJob, mutationResult ] = useCreateJobMutation(printQueueID, files, {})
  const [print, printMutationResult ] = useMutation(PRINT_MUTATION)

  const machine = machines.find(machine => machine.status === 'READY')

  const [loading, setLoading] = useState(true)

  const submit = useAsync({
    deferFn: async ([{ printNow }]) => {
      const MB = 1000 * 1000
      const fileMBs = files[0].size / MB
      const uploadStartedAt = Date.now()
      const createJobResult = await createJob()

      const uploadSeconds = (Date.now() - uploadStartedAt) / 1000
      console.log(
        'Upload Complete: '
        + `${fileMBs.toFixed(1)}MB uploaded in ${uploadSeconds.toFixed(1)} seconds = `
        + `${(fileMBs / uploadSeconds).toFixed(1)} MB/s`
      )

      if (createJobResult.errors != null) {
        throw new Error(createJobResult.errors[0].message)
      }
      console.log({ createJobResult })

      if (printNow) {
        const printResults = await print({
          variables: {
            input: {
              machineID: machine.id,
              partID: createJobResult.data.createJob.parts[0].id,
            },
          },
        })

        if (printResults.errors != null) {
          throw new Error(printResults.errors[0].message)
        }
      }

      onClose()
    },
  })

  if (submit.error) {
    throw submit.error
  }

  const addToQueue = useCallback(() => submit.run({ printNow: false }), [machine, files])
  const printNow = useCallback(() => submit.run({ printNow: true }), [machine, files])

  // if (subscription.loading) {
  //   return <div />
  // }

  const error = mutationResult.error || printMutationResult.error
  if (error) {
    throw error
  }

  return (
    <Dialog
      maxWidth={false}
      onClose={onClose}
      aria-labelledby="print-dialog-title"
      open
      transitionDuration={{
        exit: 0,
      }}
    >
      <DialogTitle id="print-dialog-title">
        Print Preview
      </DialogTitle>
      <DialogContent>
        { open && (
          <PrintDialogContent
            files={files}
            submitting={submit.isPending}
            loading={loading}
            setLoading={setLoading}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button
          onClick={addToQueue}
          variant="outlined"
          disabled={loading || submit.isPending}
        >
          Add to Queue
        </Button>
        <Button
          onClick={printNow}
          color="primary"
          variant="contained"
          disabled={machine == null || loading || submit.isPending}
        >
          Print Now
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default PrintDialog
