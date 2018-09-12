// import { compose, withContext } from 'recompose'
import QRReader from 'react-qr-reader'

const global = typeof window === 'undefined' ? {} : window

// SHARED:

global.keypair = keypair
global.clientKeys = keypair({ bits: 1024 }) // TODO: 2048
global.hostKeys = keypair({ bits: 1024 })

// const enhance = compose(
// )

// const p = process.browser ? simplePeerTest({initiator:  false}) : null
// <div
//   onClick={() => p.signal(JSON.parse(
//     document.querySelector('#signalInput').value
//   ))}
// >

// const Index = () => (
//   <div style={{ width: 300 }}>
//     <QRReader
//       onScan={scan => {
//         if (scan != null) {
//           console.log('SCAN', scan)
//         }
//       }}
//       style={{ width: '100%' }}
//     />
//   </div>
// )

const Index = () => <div>Web</div>

// export default enhance(Index)

export default Index
