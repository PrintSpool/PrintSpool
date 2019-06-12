import React from 'react'
import { compose, withState } from 'recompose'
import classNames from 'classnames'
import {
  Button,
  withStyles,
} from '@material-ui/core'
import Report from '@material-ui/icons/Report'

import useExecGCodes from '../../../_hooks/useExecGCodes'

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

const EStopResetToggle = ({
  printer,
  classes,
  dialogOpen,
  setDialogOpen,
  buttonClass,
}) => {
  const { status } = printer
  const showEStop = status !== 'ERRORED' && status !== 'ESTOPPED'
  const disabled = status === 'DISCONNECTED'

  const toggle = useExecGCodes(() => ({
    printer,
    gcodes: [
      showEStop ? 'eStop' : 'reset',
    ],
  }), [showEStop])

  const reset = useExecGCodes(() => ({
    printer,
    gcodes: ['reset'],
  }))

  return (
    <div>
      <StatusDialog
        open={dialogOpen}
        printer={printer}
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
