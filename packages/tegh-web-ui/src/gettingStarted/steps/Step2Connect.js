import React from 'react'

import {
  Typography,
  TextField,
} from '@material-ui/core'

import QRReader from 'react-qr-reader'

import { parseInviteCode } from 'graphql-things'

import Step2ConnectStyles from './Step2ConnectStyles'

const Step2Connect = ({
  history,
}) => {
  const classes = Step2ConnectStyles()

  const onSubmit = (inviteString) => {
    const sanitizedInviteString = inviteString.replace(/[\n ]/g, '')
    const invite = parseInviteCode(sanitizedInviteString)

    if (invite == null) return

    history.push(`/get-started/3?invite=${sanitizedInviteString}`)
  }

  const onTextChange = (event) => {
    const inviteString = event.target.value
    if (inviteString == null || inviteString.length === 0) return
    onSubmit(inviteString)
  }

  const onScan = (scan) => {
    if (scan != null) onSubmit(scan)
  }

  const onError = (error) => {
    // eslint-disable-next-line no-console
    console.error(error)
  }

  return (
    <div className={classes.root}>
      <Typography variant="h5" paragraph>
        Connect to your 3D Printer
      </Typography>
      <Typography variant="body1" paragraph>
        Scan or copy the Invite Code from your Raspberry Pi&apos;s terminal to establish a secure connection.
      </Typography>
      <Typography variant="h6">
        Scan your Invite QR Code
      </Typography>
      <div className={classes.qrCodeContainer}>
        <QRReader
          onScan={onScan}
          onError={onError}
          className={classes.qrCode}
        />
      </div>
      <TextField
        label="Or paste the Invite text"
        margin="normal"
        onChange={onTextChange}
      />
    </div>
  )
}

export default Step2Connect
