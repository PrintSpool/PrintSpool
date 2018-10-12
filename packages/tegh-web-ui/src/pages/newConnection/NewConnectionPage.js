import React from 'react'
import { compose, withContext } from 'recompose'
import { connect } from 'react-redux'
// import { ApolloProvider, Query } from 'react-apollo'
// import gql from 'graphql-tag'

import QRReader from 'react-qr-reader'

const enhance = compose(
  connect(state => ({
    hostPublicKey: state.keys.hostPublicKey,
  })),
)

const NewConnectionPage = () => {
  return (
    <div style={{ width: 300 }}>
      <QRReader
        onScan={(scan) => {
          if (scan == null) return
          json = JSON.parse(scan)
          if (json == null || json.publicKey == null) return
          console.log(`QR Code Scanned. Connecting...\n${json.publicKey}`)
          localStorage.setItem('peerPublicKey', peerPublicKey)
        }}
        onError={error => {
          console.log('error', error)
        }}
        style={{ width: '100%' }}
      />
    </div>
  )
}

export default enhance(NewConnectionPage)
