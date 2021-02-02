import React, { useCallback, useState } from 'react'
import { gql } from '@apollo/client'
import { useAsync } from 'react-async'

import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import DialogActions from '@material-ui/core/DialogActions'

import PrintDialogContent from './PrintDialogContent'
import useCreateJobMutation from './useCreateJobMutation'

import useLiveSubscription from '../_hooks/useLiveSubscription'
import { useMutation } from '@apollo/client'

const PRINT_DIALOG_SUBSCRIPTION = gql`
  subscription PrintDialogSubscription {
    live {
      patch { op, path, from, value }
      query {
        machines {
          id
          name
          status
        }
      }
    }
  }
`

const SPOOL_JOB_FILE = gql`
  mutation spoolJobFile($input: SpoolJobFileInput!) {
    spoolJobFile(input: $input) { id }
  }
`

const PrintDialog = ({
  files,
  onClose,
}) => {
  const subscription = useLiveSubscription(PRINT_DIALOG_SUBSCRIPTION)
  const [ createJob, mutationResult ] = useCreateJobMutation(files, {})
  const [spoolJobFile, spoolMutationResult ] = useMutation(SPOOL_JOB_FILE)

  const machine = (subscription as any).data?.machines.find(machine => machine.status === 'READY')

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
        const spoolJobFileResult = await spoolJobFile({
          variables: {
            input: {
              machineID: machine.id,
              jobFileID: createJobResult.data.createJob.files[0].id,
            },
          },
        })

        if (spoolJobFileResult.errors != null) {
          throw new Error(spoolJobFileResult.errors[0].message)
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

  if (subscription.loading) {
    return <div />
  }

  const error = subscription.error || mutationResult.error || spoolMutationResult.error
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
