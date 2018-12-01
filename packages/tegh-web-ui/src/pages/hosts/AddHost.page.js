import React from 'react'
import { compose, withProps } from 'recompose'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'

import QRReader from 'react-qr-reader'

import { TextField } from '@material-ui/core'

import { getFingerprint } from 'tegh-protocol'

import { push as pushHistoryAction } from '@d1plo1d/connected-react-router'
import addHostIdentityAction from '../../actions/addHostIdentity'

const enhance = compose(
  connect(null, {
    pushHistory: pushHistoryAction,
    addHostIdentity: addHostIdentityAction,
  }),
  withProps(({ addHostIdentity, pushHistory }) => ({
    onSubmit: (keyString) => {
      const json = (() => {
        try {
          return JSON.parse(keyString)
        } catch {
          return null
        }
      })()
      if (json == null || json.publicKey == null) return

      // eslint-disable-next-line no-console
      console.log(`QR Code Scanned. Connecting...\n${json.publicKey}\n${keyString}`)

      const id = getFingerprint({ public: json.publicKey })

      addHostIdentity({
        hostIdentity: {
          id,
          public: json.publicKey,
        },
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
        const keyString = (() => {
          try {
            return atob(event.target.value)
          } catch {
            return null
          }
        })()
        if (keyString == null) return
        onSubmit(keyString)
      }}
    />

  </div>
)

export default enhance(AddHostPage)
