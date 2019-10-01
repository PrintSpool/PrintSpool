import React from 'react'
import { compose, withState } from 'recompose'
import classNames from 'classnames'
import { useMutation } from 'react-apollo-hooks'
import gql from 'graphql-tag'
import {
  Button,
} from '@material-ui/core'
import {
  withStyles,
} from '@material-ui/styles'

import Report from '@material-ui/icons/Report'

import StatusDialog from './StatusDialog'

const styles = theme => ({
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
})


const enhance = compose(
  withState('dialogOpen', 'setDialogOpen', false),
  withStyles(styles),
)

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
  mutation reset($input: ResetInput!) {
    reset(input: $input)
  }
`

const ESTOP = gql`
  mutation eStop($input: EStopInput!) {
    eStop(input: $input)
  }
`

const EStopResetToggle = ({
  machine,
  classes,
  dialogOpen,
  setDialogOpen,
  buttonClass,
}) => {
  const { status } = machine
  const showEStop = status !== 'ERRORED' && status !== 'ESTOPPED'
  const disabled = status === 'DISCONNECTED'

  const variables = { input: { machineID: machine.id } }
  const [reset] = useMutation(RESET, { variables })
  const [eStop] = useMutation(ESTOP, { variables })

  const toggle = showEStop ? eStop : reset

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
        {showEStop ? 'EStop' : 'Reset'}
      </Button>
    </div>
  )
}

export default enhance(EStopResetToggle)
