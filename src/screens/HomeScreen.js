import React, {useState, useEffect} from 'react';
import {
  Text,
  StyleSheet,
  View,
  ImageBackground,
  Dimensions,
  FlatList,
  ActivityIndicator,
} from 'react-native';

import SwipeButton from 'rn-swipe-button';

import BleModule from '../utils/BleModule';
import BLEButton from '../components/BLEButton';
import {requestLocationPermission} from '../utils/RequestLocationPermission';
import ToastMessage from '../utils/Toast';

// Ensure that there is only one BleManager instance globally, and the BleModule class holds the Bluetooth connection information
global.BluetoothManager = new BleModule();

const win = Dimensions.get('window');
const ratio = win.width / 2400;

const HomeScreen = ({navigation}) => {
  const [state, setState] = useState({
    range: '0',
    battery: '0',
    status: 'PARKED',
    listBleDevices: false,
    isScanning: false,
    isConnecting: false,
    deviceConnected: false,
  });

  const [bleState, setBleState] = useState({
    devicesMeta: [],
  });

  useEffect(() => {
    const subscription = BluetoothManager.manager.onStateChange(bleState => {
      if (bleState === 'PoweredOn') {
        subscription.remove();
        console.log('Inside bleState');
      }
    }, true);

    return () => {
      subscription.remove();
      // characteristicSubscription.remove();
      BluetoothManager.manager.stopDeviceScan();
      BluetoothManager.manager.destroy();
    };
  }, []);

  // useEffect(() => {

  //   return () => {
  //     // characteristicSubscription.remove();
  //     if (state.deviceConnected) {
  //       // characteristicSubscription.remove();
  //     }
  //   }
  // });

  // if (state.deviceConnected) {
  //   const characteristicSubscription = BluetoothManager.manager.monitorCharacteristicForDevice(
  //     '5E:EE:00:A1:DE:01',
  //     '00000000-0001-11e1-9ab4-0002a5d5c51b',
  //     '00140000-0001-11e1-ac36-0002a5d5c51b',
  //     (error, result) => {
  //       if (error) {
  //         console.log("ERROR ON MONITOR =", error);
  //         return;
  //       }
  //       // console.log(result.value);

  //       if (state.status !== result.value) {
  //         setTimeout(() => {
  //           console.log(BluetoothManager.base64ToString(result.value));
  //         }, 10000);
  //         // console.log(BluetoothManager.base64ToString(result.value));
  //         // setState({...state, status: BluetoothManager.base64ToString(result.value)});
  //       }

  //     }
  //     // Think about a way to perform characteristicSubscription.remove()
  //   );
  // }

  const connectToDevice = dvc => {
    dvc
      .connect()
      .then(device => {
        console.log('Connected to ', device.id);
        ToastMessage('Connected to ' + String(device.name));
        setState({
          ...state,
          isScanning: false,
          listBleDevices: false,
          deviceConnected: true,
          isConnecting: false,
        });
        setBleState({...bleState, devicesMeta: []});
        BluetoothManager.manager.stopDeviceScan();
        return device.discoverAllServicesAndCharacteristics();
      })
      .then(device => {
        // Do work on device with services and characteristics
        setState({
          ...state,
          isScanning: false,
          listBleDevices: false,
          deviceConnected: true,
          isConnecting: false,
        });
        // return device.readCharacteristicForService('00001800-0000-1000-8000-00805f9b34fb', '00002a00-0000-1000-8000-00805f9b34fb');
      })
      .catch(error => {
        // Handle errors
        console.log(error);
        ToastMessage(String(error));
        setState({
          ...state,
          isScanning: false,
          listBleDevices: false,
          deviceConnected: false,
          isConnecting: false,
        });
        setBleState({...bleState, devicesMeta: []});
        BluetoothManager.manager.stopDeviceScan();
      });
  };

  const scanAndConnect = () => {
    const permission = requestLocationPermission();
    if (permission) {
      // BluetoothManager.manager.stopDeviceScan();
      setState({...state, isScanning: true});
      let devicesMeta = [];

      BluetoothManager.manager.startDeviceScan(null, null, (error, device) => {
        if (error) {
          // Handle error (scanning will be stopped automatically)
          // console.warn(error);
          ToastMessage(String(error));
          setState({...state, isScanning: false});
          return;
        }
        // Only add devies with a name
        if (device !== null && device.name) {
          if (
            !containsDevice({name: device.name, id: device.id}, devicesMeta)
          ) {
            console.log(
              'Adding new device ----> [id,name]',
              device.id,
              device.name,
            );
            devicesMeta.push({
              name: device.name,
              id: device.id,
              deviceObj: device,
            });
          }

          setBleState({...bleState, devicesMeta});

          // Check if it is a device you are looking for based on advertisement data
          // or other criteria.
          // if (device.isConnectable && device.name === 'Switch Mid-Drive') {
          //     connectToDevice(device);
          // }
        }
      });
    }
  };

  const _onPressButton = () => {
    scanAndConnect();
    setState({
      ...state,
      listBleDevices: true,
      isScanning: true,
      isConnecting: true,
    });
  };

  const _onHomePressButton = () => {
    setState({
      ...state,
      listBleDevices: false,
      isScanning: false,
      isConnecting: false,
    });
    setBleState({...bleState, devicesMeta: []});
    BluetoothManager.manager.stopDeviceScan();
  };

  const containsDevice = (device, devices) => {
    for (let i = 0; i < devices.length; i++) {
      if (devices[i].id == device.id) {
        return true;
      }
    }
    return false;
  };

  const renderItem = ({item}) => (
    <View key={item.id} style={styles.row}>
      <Text style={[styles.textNormal, styles.textContent]}>
        {item.name ? item.name : 'Unknown'} ({item.id})
      </Text>
      <BLEButton
        title="Connect"
        onPress={() => {
          ToastMessage('Connecting to ' + String(item.name));
          setState({...state, listBleDevices: false});
          connectToDevice(item.deviceObj);
        }}
      />
    </View>
  );

  return (
    <View style={styles.fullScreenViewStyle}>
      {state.listBleDevices && (
        <View style={styles.outerContainer}>
          <Text style={styles.textNormal}>SELECT YOUR DEVICE</Text>

          <View style={styles.centerContents}>
            {bleState.devicesMeta && (
              <FlatList
                data={bleState.devicesMeta}
                renderItem={renderItem}
                keyExtractor={item => item.id}></FlatList>
            )}
            {state.isScanning && (
              <ActivityIndicator size="large" color="#000000" />
            )}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                alignContent: 'space-between',
              }}>
              <BLEButton title="Refresh" onPress={scanAndConnect} />
              <View style={{width: 50, height: 100}} />
              <BLEButton title="Home" onPress={_onHomePressButton} />
            </View>
          </View>
        </View>
      )}
      {!state.listBleDevices && (
        <View style={styles.homeScreenContainer}>
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
          <View style={{flex: 2, flexDirection: 'column-reverse'}}>
            <ImageBackground
              source={require('../assets/img/cycle.png')}
              style={styles.backgroundImageStyle}
            />
          </View>
          <View style={styles.switchViewStyle}>
            <SwipeButton
              disabled={state.isConnecting}
              //disable the button by doing true (Optional)
              swipeSuccessThreshold={70}
              height={45}
              //height of the button (Optional)
              width={200}
              //width of the button (Optional)
              title={state.deviceConnected ? 'Connected' : 'Connect'}
              //Text inside the button (Optional)
              //thumbIconImageSource={thumbIcon}
              //You can also set your own icon (Optional)
              onSwipeSuccess={_onPressButton}
              //After the completion of swipe (Optional)
              railFillBackgroundColor="#00ff00" //(Optional)
              railFillBorderColor="#00ff00" //(Optional)
              thumbIconBackgroundColor="#ffffff" //(Optional)
              thumbIconBorderColor="#000000" //(Optional)
              railBackgroundColor="#c5c5c5" //(Optional)
              railBorderColor="#c5c5c5" //(Optional)
            />
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  backgroundImageStyle: {
    width: win.width,
    height: 1410 * ratio,
  },
  fullScreenViewStyle: {
    flex: 1,
    flexDirection: 'column',
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
    color: '#000000',
    textAlign: 'center',
    fontSize: 15,
    fontWeight: 'bold',
  },
  outerContainer: {
    margin: 10,
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  homeScreenContainer: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
});

export default HomeScreen;
