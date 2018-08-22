import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

// import { SerialPort } from 'tegh-core'

// import { UsbSerial} from 'react-native-usbserial'
//
// const usbs = new UsbSerial()

console.log('wat')
// const usbList = SerialPort.getDeviceList()
// usbList.then(result => console.log(result))

export default class App extends React.Component {
  // componentDidMount() {
  //   getDeviceAsync(this)
  // }

  render() {
    return (
      <View style={styles.container}>
        <Text>11</Text>
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
