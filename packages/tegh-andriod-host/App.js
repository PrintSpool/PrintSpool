import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { UsbSerial} from 'react-native-usbserial'

const usbs = new UsbSerial()

console.log('wat')
const usbList = usbs.getDeviceListAsync()

usbList.then(result => console.log(result))

async function getDeviceAsync(component) {

    // try {
        // const deviceList = await usbs.getDeviceListAsync();
        // const firstDevice = deviceList[0];

        // component.setState({json: JSON.stringify(deviceList)})
        // console.log(firstDevice);
        //
        // if (firstDevice) {
        //     const usbSerialDevice = await usbs.openDeviceAsync(firstDevice);
        //
        //     console.log(usbSerialDevice);
        // }
    // } catch (err) {
    //     component.setState({json: {msg: err.message, stack: err.stack}})
    // }
}

export default class App extends React.Component {
  componentDidMount() {
    getDeviceAsync(this)
  }

  render() {
    return (
      <View style={styles.container}>
        <Text>1231</Text>
      </View>
    );
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
