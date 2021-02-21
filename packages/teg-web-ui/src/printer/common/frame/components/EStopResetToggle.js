import React, { useState } from 'react'
import classNames from 'classnames'
import { useMutation } from '@apollo/client'
import { gql } from '@apollo/client'

import Button from '@material-ui/core/Button'
import { makeStyles } from '@material-ui/core/styles'

import Report from '@material-ui/icons/Report'

import StatusDialog from './StatusDialog'
import useConfirm from '../../../../common/_hooks/useConfirm'

const useStyles = makeStyles(theme => ({
  leftIcon: {
    marginRight: theme.spacing(1),
  },
  rightIcon: {
    marginLeft: theme.spacing(1),
  },
  status: {
    marginRight: theme.spacing(1),
  },
  toggleEStopReset: {
    backgroundColor: theme.palette.background.default,
    boxShadow: 'none',
  },
  eStop: {
    color: theme.palette.error.main,
  },
}))

// const statusColor = (status) => {
//   switch(status) {
//     case 'READY':
//     case 'PRINTING':
//       return '#1B5E20'
//     case 'ERRORED':
//     case 'ESTOPPED':
//       return '#D50000'
//     default:
//       return '#FF5722'
//   }
// }

const RESET = gql`
  mutation reset($machineID: ID!) {
    reset(machineID: $machineID) { id }
  }
`

const STOP = gql`
  mutation stop($machineID: ID!) {
    stop(machineID: $machineID) { id }
  }
`

const EStopResetToggle = ({
  machine,
  buttonClass,
}) => {
  const classes = useStyles()
  const [dialogOpen, setDialogOpen] = useState(false)

  const { status } = machine
  const showEStop = status !== 'ERRORED' && status !== 'STOPPED'
  const disabled = status === 'DISCONNECTED'

  const variables = { machineID: machine.id }
  const [reset] = useMutation(RESET, { variables })
  const [eStop] = useMutation(STOP, { variables })

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

  return (
    <div>
      <StatusDialog
        open={dialogOpen}
        machine={machine}
        handleClose={() => { setDialogOpen(false) }}
        handleReset={reset}
      />
      <Button
        className={classNames(buttonClass, classes.status)}
        onClick={() => { setDialogOpen(true) }}
      >
        { status }
      </Button>
      <Button
        className={
          classNames(classes.toggleEStopReset, showEStop && classes.eStop)
        }
        variant="contained"
        disabled={disabled}
        onClick={toggle}
      >
        {
          showEStop
          && <Report className={classes.leftIcon} />
        }
        {showEStop ? 'Stop' : 'Reset'}
      </Button>
    </div>
  )
}

export default EStopResetToggle
