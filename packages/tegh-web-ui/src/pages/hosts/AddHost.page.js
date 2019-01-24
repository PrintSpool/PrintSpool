import React from 'react'
import bs58 from 'bs58'
import { compose, withProps } from 'recompose'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'

import QRReader from 'react-qr-reader'

import { TextField } from '@material-ui/core'

import { parseInviteCode } from 'graphql-things'

import { push as pushHistoryAction } from '@d1plo1d/connected-react-router'
import addHostIdentityAction from '../../actions/addHostIdentity'

const enhance = compose(
  connect(null, {
    pushHistory: pushHistoryAction,
    addHostIdentity: addHostIdentityAction,
  }),
  withProps(({ addHostIdentity, pushHistory }) => ({
    onSubmit: (keyString) => {
      const invite = (() => {
        // try {
          return parseInviteCode(keyString.replace('\n', ''))
        // } catch {
        //   return null
        // }
      })()

      if (invite == null) return

      const pk = invite.peerIdentityPublicKey
      const id = bs58.encode(Buffer.from(pk, 'hex'))
      invite.id = id

      // eslint-disable-next-line no-console
      console.log(`QR Code Scanned. Connecting to ${id}\n`)

      addHostIdentity({
        hostIdentity: invite,
      })

      pushHistory(`/${id}/`)
    },
  })),
)

const AddHostPage = ({
  onSubmit,
}) => (
  <div style={{ width: 300 }}>
    <br />
    <br />
    <Link to="/">
      <button type="button">
        Back
      </button>
    </Link>
    <br />
    <br />
    <QRReader
      onScan={(scan) => {
        if (scan != null) onSubmit(scan)
      }}
      onError={(error) => {
        // eslint-disable-next-line no-console
        console.log('error', error)
      }}
      style={{ width: '100%' }}
    />
    <TextField
      label="Host Key"
      margin="normal"
      onChange={(event) => {
        const keyString = event.target.value
        if (keyString == null || keyString.length === 0) return
        onSubmit(keyString)
      }}
    />

  </div>
)

export default enhance(AddHostPage)
