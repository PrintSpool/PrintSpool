import React from 'react'
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@material-ui/core'
import snl from 'strip-newlines'

const descriptions = {
  CONNECTING: () => snl`
    The 3D printer has been detected and is attempting to connect.
    This should not take more then a few seconds.
    If it is not connecting please make sure the printer is turned on.
  `,
  READY: () => snl`
    The 3D printer is connected and ready to print.
  `,
  PRINTING: () => snl`
    The 3D printer is printing.
  `,
  PAUSED: () => snl`
    The 3D printer is paused. You can resume the print when your ready to continue.
  `,
  DISCONNECTED: () => snl`
    The 3D printer is disconnected. Please verify the printer is plugged in and
    turn it on.
  `,
  STOPPED: () => snl`
    The 3D printer has been estopped by a user.
    Please verify that the printer is safe and free of obstructions and then
    reset the machine.
  `,
  ERRORED: () => snl`
    The 3D printer has encountered an error.
    This may indicate an issue with your 3D printer itself, it's
    firmware or Teg.
  `,
}

const StatusDialog = ({
  open,
  machine,
  handleClose,
  handleReset,
}) => {
  const { status, error } = machine

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        { status }
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description" component="div">
          { (descriptions[status] || (() => ''))(error) }
          {
            status === 'ERRORED'
            && (
            <div>
              <h3>Error Message</h3>
              <p>{ error.message }</p>
              <h3>Error Code</h3>
              <p>{ error.code }</p>
              <h3>Next Steps</h3>
              <p>
                Please write down the error message and error code for
                your reference, verify the printer is safe and free of
                obstructions and reset the machine.
              </p>
              <p>
                If you belive this is an issue with Teg you can file a bug
                report at
                {' '}
                {' '}
                <a
                  href="https://github.com/teg/teg/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  https://github.com/teg/teg/issues
                </a>
                .
              </p>
            </div>
            )
          }
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        {
          (status === 'ERRORED' || status === 'STOPPED' || status === 'DISCONNECTED')
          && (
          <Button
            onClick={handleReset}
            color="primary"
          >
            Reset
          </Button>
          )
        }
        <Button onClick={handleClose} color="primary" autoFocus>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default StatusDialog
