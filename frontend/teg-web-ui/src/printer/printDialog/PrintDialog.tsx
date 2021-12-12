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
import { usePrintMutation } from '../jobQueue/JobQueue.graphql'
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

const PrintDialog = ({
  printQueues,
  machines,
  files,
  onClose,
}) => {
  const printQueueID = printQueues[0].id
  // const subscription = useLiveSubscription(PRINT_DIALOG_QUERY)
  const [ addPartsToPrintQueue, mutationResult ] = useCreateJobMutation(printQueueID, files)
  const [print, printMutationResult ] = usePrintMutation()

  const machine = machines.find(machine => machine.status === 'READY')

  const [loading, setLoading] = useState(true)

  const submit = useAsync({
    deferFn: async ([{ printNow }]) => {
      const addPartsToPrintQueueResult = await addPartsToPrintQueue()

      if (addPartsToPrintQueueResult.errors != null) {
        throw new Error(addPartsToPrintQueueResult.errors[0].message)
      }
      // console.log({ addPartsToPrintQueueResult })

      if (printNow) {
        const printResults = await print({
          variables: {
            input: {
              machineID: machine.id,
              partID: addPartsToPrintQueueResult.data.addPartsToPrintQueue.parts[0].id,
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

  const open = true

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
