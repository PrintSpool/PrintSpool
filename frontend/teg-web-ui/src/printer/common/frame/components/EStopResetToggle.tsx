import React, { useEffect, useState } from 'react'
import { useMutation } from '@apollo/client'
import { gql } from '@apollo/client'

import Button from '@mui/material/Button'
import Backdrop from '@mui/material/Backdrop'
import CircularProgress from '@mui/material/CircularProgress'

import Report from '@mui/icons-material/Report'

import StatusDialog from './StatusDialog'
import useConfirm from '../../../../common/_hooks/useConfirm'
import { useSnackbar } from 'notistack'
import PrinterStatusGraphQL from '../../PrinterStatus.graphql'

const RESET = gql`
  mutation reset($machineID: ID!) {
    reset(machineID: $machineID) {
      id
      ...PrinterStatus
    }
  }

  ${PrinterStatusGraphQL}
`

const STOP = gql`
  mutation stop($machineID: ID!) {
    stop(machineID: $machineID) {
      id
      ...PrinterStatus
    }
  }
  ${PrinterStatusGraphQL}
`

const EStopResetToggle = ({
  machine,
  buttonClass,
}) => {
  const { enqueueSnackbar } = useSnackbar()
  const [dialogOpen, setDialogOpen] = useState(false)

  const { status } = machine
  const showEStop = !['ERRORED', 'STOPPED', 'DISCONNECTED'].includes(status)

  const variables = { machineID: machine.id }
  const [reset, resetMutation] = useMutation(RESET, { variables })
  const [eStop, stopMutation] = useMutation(STOP, { variables })

  const confirm = useConfirm()

  const confirmedEStop = confirm(() => ({
    fn: eStop,
    title: 'Are you sure you want to stop the machine?',
    description: 'This will cancel your current print',
    confirmationButtonProps: {
      autoFocus: true,
    },
  }))

  const toggle = showEStop ? confirmedEStop : reset

  const error = resetMutation.error || stopMutation.error
  useEffect(() => {
    if (error == null) {
      return
    }

    enqueueSnackbar(
      `Error ${resetMutation.error ? 'resetting' : 'stopping'} machine: ${error.message}`,
      {
        variant: 'error',
      },
    )
  }, [error])

  const loading = resetMutation.loading || stopMutation.loading

  return (
    <div>
      <StatusDialog
        open={dialogOpen}
        machine={machine}
        handleClose={() => { setDialogOpen(false) }}
        handleReset={() => {
          reset()
          setDialogOpen(false)
        }}
      />
      <Button
        className={buttonClass}
        onClick={() => { setDialogOpen(true) }}
      >
        { status }
      </Button>
      <Button
        color={showEStop ? 'error' : undefined}
        variant="outlined"
        disabled={loading}
        onClick={toggle}
        sx={{
          ml: 1
        }}
      >
        {
          showEStop
          && <Report sx={{ mr: 1 }} />
        }
        {showEStop ? 'Stop' : 'Reset'}
      </Button>
    </div>
  )
}

export default EStopResetToggle
