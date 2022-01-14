import React, { useCallback, useMemo, useState } from 'react'
// import { gql } from '@apollo/client'
import { useAsync } from 'react-async'
// import { useMutation } from '@apollo/client'

import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'

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

  const [loading, setLoading] = useState(true)
  const [gcodeText, setGCodeText] = useState()

  const gcodeFiles = useMemo(() => {
    if (gcodeText == null) {
      return null
    }

    return [{
      file: new Blob([gcodeText]),
      name: `${files[0].name}.gcode`,
    }]
  }, [gcodeText])

  // console.log({ files, gcodeFiles })

  // const subscription = useLiveSubscription(PRINT_DIALOG_QUERY)
  const [ addPartsToPrintQueue, mutationResult ] = useCreateJobMutation({
    variables: {
      input: {
        printQueueID,
        name: files.map(f => f.name).join(', '),
        parts: gcodeFiles ?? files.map((file) => ({
          name: file.name,
          file,
        })),
      },
    },
  })
  const [print, printMutationResult ] = usePrintMutation()

  const machine = machines[0]

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
            machine={machine}
            files={files}
            submitting={submit.isPending}
            loading={loading}
            setLoading={setLoading}
            setGCodeText={setGCodeText}
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
          variant="contained"
          disabled={machine?.status !== 'READY' || loading || submit.isPending}
        >
          Print Now
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default PrintDialog
