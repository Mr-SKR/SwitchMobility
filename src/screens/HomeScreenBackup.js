import React, {useState, useEffect} from 'react';
import {
  Text,
  StyleSheet,
  View,
  Image,
  ImageBackground,
  TouchableOpacity,
  Dimensions,
  PermissionsAndroid,
  ActivityIndicator,
} from 'react-native';
import {BleManager} from 'react-native-ble-plx';
import {showMessage} from 'react-native-flash-message';

import BleModule from '../components/BleModule';
import BLEButton from '../components/BLEButton';
// Ensure that there is only one BleManager instance globally, and the BleModule class holds the Bluetooth connection information
global.BluetoothManager = new BleModule();

const manager = new BleManager();
const win = Dimensions.get('window');
const ratio = win.width / 2400;

export async function requestLocationPermission() {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
      {
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

const HomeScreen = ({navigation}) => {
  const [state, setState] = useState({
    range: '0',
    battery: '0',
    status: 'PARKED',
    bleManager: false,
    listBleDevices: false,
    devices: [],
    devicesMeta: null,
    isScanning: false,
    canScan: true,
  });

  useEffect(() => {
    manager.onStateChange(bleState => {
      const subscription = manager.onStateChange(bleState => {
        if (bleState === 'PoweredOn') {
          subscription.remove();
        }
      }, true);
      return () => subscription.remove();
    });
  }, []);

  const connectToDevice = dvc => {
    dvc
      .connect()
      .then(device => {
        {
          showMessage({
            message: 'Connected to ' + device.id,
            type: 'info',
          });
        }
        console.log('Connected to ', device.id);
        return device.discoverAllServicesAndCharacteristics();
      })
      .then(device => {
        // Do work on device with services and characteristics
        setState({
          ...state,
          devices: [],
          devicesMeta: null,
          isScanning: false,
          listBleDevices: false,
        });
        manager.stopDeviceScan();
      })
      .catch(error => {
        // Handle errors
        setState({
          ...state,
          devices: [],
          devicesMeta: null,
          isScanning: false,
          listBleDevices: false,
        });
        manager.stopDeviceScan();
      });
  };

  const scanAndConnect = () => {
    const permission = requestLocationPermission();
    if (permission) {
      setState({...state, devices: [], devicesMeta: null, isScanning: false});
      if (state.canScan) {
        // startDeviceScan(UUIDs: Array<UUID>?, options: ScanOptions?, listener: function (error: BleError?, scannedDevice: Device?))
        /**
         * UUIDs (Array<UUID>?) Array of strings containing UUID s of Service s which are registered in scanned Device . If null is passed, all available Device s will be scanned.
         * options (ScanOptions?) Optional configuration for scanning operation.
         * listener (function (error: BleError?, scannedDevice: Device?))
         */
        setState({...state, isScanning: true});

        manager.startDeviceScan(null, null, (error, device) => {
          // console.log(device);
          if (error) {
            // Handle error (scanning will be stopped automatically)
            console.warn(error);
            return;
          }

          if (device !== null) {
            console.log('device found ----> [id,name]', device.id, device.name);
          }

          const devicesMeta = state.devicesMeta ? state.devicesMeta : [];
          const devices = [...state.devices];
          devices.push({device});

          setState({
            ...state,
            devicesMeta: [...devicesMeta, {name: device.name, id: device.id}],
            devices,
          });

          // Check if it is a device you are looking for based on advertisement data
          // or other criteria.
          // if (device.isConnectable && device.name === 'Switch Mid-Drive') {
          //     connectToDevice(device);
          // }
        });
      }
    }
  };

  const _onPressButton = () => {
    setState({...state, listBleDevices: true});
    // alert('You tapped the button!');
  };

  const _onHomePressButton = () => {
    setState({...state, listBleDevices: false});
    // alert('You tapped the button!');
  };

  return (
    <>
      {state.listBleDevices && (
        <View style={styles.outerContainer}>
          <Text style={styles.textNormal}>BluetoothScreen</Text>
          <BLEButton title="Scan Devices" onPress={scanAndConnect} />
          <View style={styles.centerContents}>
            {state.devicesMeta &&
              state.devicesMeta.map((device, idx) => (
                <View key={idx} style={styles.row}>
                  <Text style={[styles.textNormal, styles.textContent]}>
                    name: {device.name ? device.name : 'Unknown'} id:{' '}
                    {device.id}
                  </Text>
                  <BLEButton
                    title="Connect"
                    onPress={() => connectToDevice(state.devices[idx].device)}
                  />
                </View>
              ))}
            {state.isScanning && <ActivityIndicator size="small" />}
            <BLEButton title="Return Home" onPress={_onHomePressButton} />
          </View>
        </View>
      )}
      {!state.listBleDevices && (
        <View style={styles.fullScreenViewStyle}>
          <View style={styles.switchViewStyle}>
            <TouchableOpacity onPress={_onPressButton}>
              <Image
                source={
                  state.listBleDevices
                    ? require('../assets/img/switch.png')
                    : require('../assets/img/switch-off.png')
                }
              />
            </TouchableOpacity>
          </View>
          <View style={{flex: 2, flexDirection: 'column-reverse'}}>
            <ImageBackground
              source={require('../assets/img/cycle.png')}
              style={styles.backgroundImageStyle}
            />
          </View>
          <View
            style={{
              flex: 1,
              flexDirection: 'column',
              justifyContent: 'space-evenly',
              alignItems: 'center',
            }}>
            <Text>Battery: {state.battery}</Text>
            <Text>Range: {state.range}</Text>
            <Text>Status: {state.status}</Text>
          </View>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  backgroundImageStyle: {
    width: win.width,
    height: 1410 * ratio,
  },
  fullScreenViewStyle: {
    flex: 1,
    flexDirection: 'column-reverse',
  },
  switchViewStyle: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },

  centerContents: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // container: {
  //   flexDirection: 'row',
  //   flex: 1,
  //   alignItems: 'center',
  //   justifyContent: 'center',
  // },
  textContent: {
    height: 'auto',
    flexWrap: 'wrap',
    marginRight: 10,
    width: win.width * 0.6,
  },
  row: {
    alignItems: 'center',
    marginHorizontal: 10,
    flexDirection: 'row',
  },
  textNormal: {
    color: '#FFFFFF',
    textAlign: 'center',
  },
  outerContainer: {
    flex: 1,
    backgroundColor: '#111928',
  },
});

export default HomeScreen;
