// import { compose, withContext } from 'recompose'
import simplePeerTest from './simplePeerTest'
import QRReader from 'react-qr-reader'

// const enhance = compose(
// )

// const p = process.browser ? simplePeerTest({initiator:  false}) : null
// <div
//   onClick={() => p.signal(JSON.parse(
//     document.querySelector('#signalInput').value
//   ))}
// >

const Index = () => (
  <div style={{ width: 300 }}>
    <QRReader
      onScan={scan => {
        if (scan != null) {
          console.log('SCAN', scan)
        }
      }}
      style={{ width: '100%' }}
    />
  </div>
)

// export default enhance(Index)

export default Index
