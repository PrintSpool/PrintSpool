import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { UsbSerial} from 'react-native-usbserial'

const usbs = new UsbSerial();

async function getDeviceAsync() {

    try {
        const deviceList = await usbs.getDeviceListAsync();
        const firstDevice = deviceList[0];

        console.log(firstDevice);

        if (firstDevice) {
            const usbSerialDevice = await usbs.openDeviceAsync(firstDevice);

            console.log(usbSerialDevice);
        }
    } catch (err) {
        console.warn(err);
    }
}

export default class App extends React.Component {
  componentDidMount() {
    getDeviceAsync()
  }

  render() {
    return (
      <View style={styles.container}>
        <Text>Open up App.js to start working on your app! Test123</Text>
        <Text>Changes you make will automatically reload.</Text>
        <Text>Shake your phone to open the developer menuwaaat.</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
