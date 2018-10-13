import React from 'react'
import { compose, withState } from 'recompose'
import {
  Button,
  withStyles,
} from '@material-ui/core'
import {
  Report,
} from '@material-ui/icons'

import withSpoolMacro from '../../shared/higherOrderComponents/withSpoolMacro'
import StatusDialog from './StatusDialog'

const styles = theme => ({
  leftIcon: {
    marginRight: theme.spacing.unit,
  },
  rightIcon: {
    marginLeft: theme.spacing.unit,
  },
})


const enhance = compose(
  withState('dialogOpen', 'setDialogOpen', false),
  withSpoolMacro,
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
  spoolMacro,
  classes,
  dialogOpen,
  setDialogOpen,
}) => {
  const { status } = printer
  const showEstop = status !== 'ERRORED' && status !== 'ESTOPPED'
  const disabled = status === 'DISCONNECTED'
  const onClick = () => {
    spoolMacro({ macro: showEstop ? 'eStop' : 'reset' })
  }

  return (
    <div>
      <StatusDialog
        open={dialogOpen}
        printer={printer}
        handleClose={() => { setDialogOpen(false) }}
        handleReset={() => spoolMacro({ macro: 'reset' })}
      />
      <div style={{ display: 'inline-block', marginRight: 10 }}>
        <Button
          onClick={() => { setDialogOpen(true) }}
        >
          { status }
        </Button>
      </div>
      <div style={{ display: 'inline-block' }}>
        <Button
          color={showEstop ? 'secondary' : 'primary'}
          variant="contained"
          disabled={disabled}
          onClick={onClick}
        >
          {
            showEstop
            && <Report className={classes.leftIcon} />
          }
          {showEstop ? 'EStop' : 'Reset'}
        </Button>
      </div>
    </div>
  )
}

export default enhance(EStopResetToggle)
