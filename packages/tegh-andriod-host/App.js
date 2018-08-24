import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

// import { SerialPort } from 'tegh-core'

// import { UsbSerial} from 'react-native-usbserial'
//
// const usbs = new UsbSerial()

import QRCode from 'react-native-qrcode'

// import simplePeerHost, { qrCodeJSON } from './src/simplePeerHost'

console.log('wat2')

const qrCodeJSON = () => 'test'

// const peerPromise = simplePeerHost({ initiator: true })

// const usbList = SerialPort.getDeviceList()
// usbList.then(result => console.log(result))

export default class App extends React.Component {
  constructor(props) {
    console.log('when')
    super(props)
    this.state = {}
  }

  async componentDidMount() {
    console.log('wat')
    // await peerPromise
    console.log('loaded')
    this.setState({loaded: 'loaded'})
  }

  render() {
    return (
      <View style={styles.container}>
        <Text>{this.state.loaded || 'loading'}</Text>
        <QRCode
          value={qrCodeJSON()}
          size={200}
          bgColor='purple'
          fgColor='white'/>
      </View>
    )
  }
}
// <Text>{ this.state && JSON.stringify(this.state.json) || "Loading..." }</Text>

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
