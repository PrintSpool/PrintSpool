import React, { useContext, useCallback, useEffect } from 'react'
import gql from 'graphql-tag'

import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@material-ui/core'

import PrintDialogContent from './PrintDialogContent'
import useCreateJobMutation from './useCreateJobMutation'

import PrintFilesContext from './PrintFilesContext'
import useLiveSubscription from '../_hooks/useLiveSubscription'
import { useMutation } from 'react-apollo-hooks'

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
  history,
  match,
}) => {
  const [files] = useContext(PrintFilesContext)

  const { hostID } = match.params
  const open = true

  const subscription = useLiveSubscription(PRINT_DIALOG_SUBSCRIPTION)
  const [ createJob, mutationResult ] = useCreateJobMutation(files, {})
  const [spoolJobFile, spoolMutationResult ] = useMutation(SPOOL_JOB_FILE)

  const machine = (subscription as any).data?.machines.find(machine => machine.status === 'READY')

  const successRedirect = () => history.push(`/q/${hostID}/`)

  const addToQueue = useCallback(async () => {
    const createJobResult = await createJob()
    if (createJobResult.errors == null) successRedirect()
  }, [])

  const printNow = useCallback(async () => {
    const createJobResult = await createJob()
    if (createJobResult.errors != null) return
    console.log({ createJobResult })

    const spoolJobFileResult = await spoolJobFile({
      variables: {
        input: {
          machineID: machine.id,
          jobFileID: createJobResult.data.createJob.files[0].id,
        },
      },
    })

    if (spoolJobFileResult.errors != null) return

    successRedirect()
  }, [machine])

  const onClose = useCallback(() => {
    history.push('../')
  }, [])

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
      open={open}
      transitionDuration={{
        exit: 0,
      }}
    >
      <DialogTitle id="print-dialog-title">
        Print Preview
      </DialogTitle>
      <DialogContent>
        { open && (
          <PrintDialogContent files={files} />
        )}
      </DialogContent>
      <DialogActions>
        <Button
          onClick={addToQueue}
          variant="outlined"
        >
          Add to Queue
        </Button>
        <Button
          onClick={printNow}
          color="primary"
          variant="contained"
          disabled={machine == null}
        >
          Print Now
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default PrintDialog
