import React, {useState, useEffect} from 'react';
import { Text, StyleSheet, View, Image, ImageBackground, TouchableOpacity, Dimensions, PermissionsAndroid } from 'react-native';
import { BleManager } from 'react-native-ble-plx';

const manager = new BleManager();
const win = Dimensions.get('window');
const ratio = win.width/2400;

export async function requestLocationPermission() {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION, {
        title: 'Location permission for bluetooth scanning',
        message: 'wahtever',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    ); 
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log('Location permission for bluetooth scanning granted');
      return true;
    } else {
      console.log('Location permission for bluetooth scanning revoked');
      return false;
    }
  } catch (err) {
    console.warn(err);
    return false;
  }
}

const HomeScreen = ({ navigation }) => {

  const [state, setState] = useState({range: "0", battery: "0", status: "PARKED", switch: false, bleManager: false});

  const scanAndConnect = () => {
    const permission = requestLocationPermission();
    if (permission) {
      manager.startDeviceScan(null, null, (error, device) => {
        // console.log(device.id);
        // console.log(device);
          if (error) {
              // Handle error (scanning will be stopped automatically)
              console.warn(error);
              return
          }

          if (device !== null) {
            console.log("device found ----> [id,name]", device.id, device.name);
        }
  
          // Check if it is a device you are looking for based on advertisement data
          // or other criteria.
          if (device.name === 'TI BLE Sensor Tag' || 
              device.name === 'SensorTag' || true) {
              
              // Stop scanning as it's not necessary if you are scanning for one device.
              console.log('Device scan stopped');
              manager.stopDeviceScan();
  
              // Proceed with connection.
              device.connect()
                .then((device) => {
                    console.log(device.discoverAllServicesAndCharacteristics());
                    return device.discoverAllServicesAndCharacteristics()
                })
                .then((device) => {
                  // Do work on device with services and characteristics
                })
                .catch((error) => {
                    // Handle errors
                });
          }
      });
    }
    
  }

  useEffect(() => {
    const subscription = manager.onStateChange((bleState) => {
      console.log(bleState);
      if (bleState === 'PoweredOn') {
          scanAndConnect();
          subscription.remove();
      }
      console.log('EXECUTED useEFFECT');
  }, true);
  });

  

  const _onPressButton = () => {
      setState({...state, switch: !state.switch});
      // alert('You tapped the button!');
    }
  return (
    <View style={styles.fullScreenViewStyle}>
      <View style={styles.switchViewStyle}>
        <TouchableOpacity onPress={_onPressButton} >
          <Image
            source={state.switch ? require('../assets/img/cycle.png'): require('../assets/img/switch.png')}
          />
        </TouchableOpacity>
      </View>
      <View style={{ flex: 2, flexDirection: "column-reverse"}}>
        <ImageBackground
          source={require('../assets/img/cycle.png')}
          style={styles.backgroundImageStyle}
        />
      </View>
      <View style={{flex: 1, flexDirection: "column", justifyContent: "space-evenly", alignItems: "center"}}>
          <Text>Battery: {state.battery}</Text>
          <Text>Range: {state.range}</Text>
          <Text>Status: {state.status}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  backgroundImageStyle: {
    width: win.width,
    height: 1410 * ratio
  },
  fullScreenViewStyle: {
    flex: 1,
    flexDirection: "column-reverse"
  },
  switchViewStyle: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    flex: 1
  },
});

export default HomeScreen;
