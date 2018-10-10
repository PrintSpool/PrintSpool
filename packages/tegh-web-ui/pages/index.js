// import { compose, withContext } from 'recompose'
import { ApolloProvider, Query } from 'react-apollo'
import gql from 'graphql-tag'

import QRReader from 'react-qr-reader'

const isNode = typeof navigator === 'undefined'

const peerPublicKeySet = !isNode && localStorage.getItem('peerPublicKey') != null

const Index = () => {
  if (isNode) return (
    <div>Server</div>
  )

  if (peerPublicKeySet) {
    return <a href="/host/index">Go to the Host Screen</a>
  }

  return (
    <div style={{ width: 300 }}>
      <QRReader
        onScan={scan => {
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

export default Index
