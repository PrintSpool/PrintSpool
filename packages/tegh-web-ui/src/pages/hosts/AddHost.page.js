import React from 'react'
import { compose } from 'recompose'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'

import QRReader from 'react-qr-reader'

import { getFingerprint } from 'tegh-protocol'

import { push as pushHistoryAction } from '@d1plo1d/connected-react-router'
import addHostIdentityAction from '../../actions/addHostIdentity'

const enhance = compose(
  connect(null, {
    pushHistory: pushHistoryAction,
    addHostIdentity: addHostIdentityAction,
  }),
)

const AddHostPage = ({
  pushHistory,
  addHostIdentity,
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
        if (scan == null) return
        const json = JSON.parse(scan)
        if (json == null || json.publicKey == null) return

        // eslint-disable-next-line no-console
        console.log(`QR Code Scanned. Connecting...\n${json.publicKey}\n${scan}`)

        const id = getFingerprint({ public: json.publicKey })

        addHostIdentity({
          hostIdentity: {
            id,
            public: json.publicKey,
          },
        })

        pushHistory(`/${id}/`)
      }}
      onError={(error) => {
        // eslint-disable-next-line no-console
        console.log('error', error)
      }}
      style={{ width: '100%' }}
    />
  </div>
)

export default enhance(AddHostPage)
