import React, {useState, useEffect} from 'react';
import {
  Text, StyleSheet, View, Image, ImageBackground, TouchableOpacity, Dimensions,
  FlatList, PermissionsAndroid, ActivityIndicator
} from 'react-native';

import { BleManager } from 'react-native-ble-plx';
import Toast from 'react-native-simple-toast';
import SwipeButton from 'rn-swipe-button';

import BleModule from '../components/BleModule';
import BLEButton from '../components/BLEButton';
// Ensure that there is only one BleManager instance globally, and the BleModule class holds the Bluetooth connection information
global.BluetoothManager = new BleModule(); 

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

  const [state, setState] = useState(
    {
      range: "0",
      battery: "0",
      status: "PARKED",
      bleManager: false,
      listBleDevices: false,
      isScanning: false,
      deviceConnected: false
    }
  );

  const [bleState, setBleState] = useState(
    {
      devicesMeta: [],
    }
  );

  useEffect(() => {
    manager.onStateChange((bleState) => {
      const subscription = manager.onStateChange((bleState) => {
          if (bleState === 'PoweredOn') {
              subscription.remove();
          }
      }, true);
      return () => {
        subscription.remove();
        manager.stopDeviceScan();
      }
    });
  }, []);

  connectToDevice = dvc => {
    dvc
      .connect()
      .then(device => {
        console.log('Connected to ', device.id);
        return device.discoverAllServicesAndCharacteristics();
      })
      .then(device => {
        // Do work on device with services and characteristics
        Toast.showWithGravity('Connected to ' + device.name, Toast.LONG, Toast.CENTER);
        setState({...state, isScanning: false, listBleDevices: false, deviceConnected: true});
        setBleState({...bleState, devicesMeta: []});
        manager.stopDeviceScan();
      })
      .catch(error => {
        // Handle errors
        Toast.showWithGravity(String(error), Toast.LONG, Toast.CENTER);
        setState({...state, isScanning: false, listBleDevices: false, deviceConnected: false});
        setBleState({...bleState, devicesMeta: []});
        manager.stopDeviceScan();
      });
  };

  const scanAndConnect = () => {
    const permission = requestLocationPermission();
    if (permission) {
      manager.stopDeviceScan();
      setState({...state, isScanning: true});
      let devicesMeta = [];
      
    
      manager.startDeviceScan(null, null, (error, device) => {
        if (error) {
            // Handle error (scanning will be stopped automatically)
            console.warn(error);
            return
        }
        // Only add devies with a name
        if (device !== null && device.name) {
          if (!containsDevice({name: device.name, id: device.id}, devicesMeta)) {
            console.log("Adding new device ----> [id,name]", device.id, device.name);
            devicesMeta.push({name: device.name, id: device.id, deviceObj: device})
          }
          
          setBleState({devicesMeta});
          
  
          // Check if it is a device you are looking for based on advertisement data
          // or other criteria.
          // if (device.isConnectable && device.name === 'Switch Mid-Drive') {
          //     connectToDevice(device);
          // }
        }

        
        
      });
    }
  }
  

  const _onPressButton = () => {
    
    setState({...state, listBleDevices: true});
    // alert('You tapped the button!');
  }
  
  const _onHomePressButton = () => {
    
    setState({...state, listBleDevices: false, isScanning: false});
    setBleState({devicesMeta: []});
    manager.stopDeviceScan();
    // alert('You tapped the button!');
  }
  
  const containsDevice = (device, devices) => {
    for (let i = 0; i < devices.length; i++) {
        if (devices[i].id == device.id) {
            return true;
        }
    }
    return false;
  }

  const renderItem = ({ item }) => (
    <View key={item.id} style={styles.row}>
      <Text style={[styles.textNormal, styles.textContent]}>
        {item.name ? item.name : 'Unknown'} ({item.id}) 
      </Text>
      <BLEButton
        title="Connect"
        onPress={
          () => {
            Toast.showWithGravity('Connecting to ' + item.name, Toast.LONG, Toast.CENTER);
            setState({...state, listBleDevices: false});
            connectToDevice(item.deviceObj);
          }
        }
      />
    </View>
  );

  
  
  return (
    <View style={styles.fullScreenViewStyle}>
      {state.listBleDevices && (
        
        <View style={styles.outerContainer}>
          <Text style={styles.textNormal}>SELECT YOUR DEVICE</Text>
          
          <View style={styles.centerContents}>
            {
              bleState.devicesMeta &&
              (
                <FlatList
                  data={bleState.devicesMeta}
                  renderItem={renderItem}
                  keyExtractor={item => item.id}
                >
                </FlatList>
              )}
          {state.isScanning && (
            <ActivityIndicator size="large" color="#000000" />
          )}
          <View style={{flexDirection: "row", alignItems: "center", alignContent: "space-between"}}>
            <BLEButton title="Scan Devices" onPress={scanAndConnect} />
            <View style={{width: 50, height: 100}} />
            <BLEButton title="Return Home" onPress={_onHomePressButton} />
          </View>
          
        </View>
        </View>
         
      )}
      {!state.listBleDevices && (
        
        <View style={styles.outerContainer}>
          <View style={{flex: 1, flexDirection: "column", justifyContent: "space-evenly", alignItems: "center"}}>
            <Text>Battery: {state.battery}</Text>
            <Text>Range: {state.range}</Text>
            <Text>Status: {state.status}</Text>
          </View>
          <View style={{ flex: 2, flexDirection: "column-reverse"}}>
            <ImageBackground
              source={require('../assets/img/cycle.png')}
              style={styles.backgroundImageStyle}
            />
          </View>
          <View style={styles.switchViewStyle}>
            <SwipeButton
              disabled={false}
              //disable the button by doing true (Optional)
              swipeSuccessThreshold={70}
              height={45}
              //height of the button (Optional)
              width={200}
              //width of the button (Optional)
              title={state.deviceConnected ? "Connected": "Bluetooth"}
              //Text inside the button (Optional)
              //thumbIconImageSource={thumbIcon}
              //You can also set your own icon (Optional)
              onSwipeSuccess={_onPressButton}
              //After the completion of swipe (Optional)
              railFillBackgroundColor="#00ff00" //(Optional)
              railFillBorderColor="#00ff00" //(Optional)
              thumbIconBackgroundColor="#ffffff" //(Optional)
              thumbIconBorderColor="#000000" //(Optional)
              railBackgroundColor="#90ee90" //(Optional)
              railBorderColor="#90ee90" //(Optional)
            />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  backgroundImageStyle: {
    width: win.width,
    height: 1410 * ratio
  },
  fullScreenViewStyle: {
    flex: 1,
    flexDirection: "column"
  },
  switchViewStyle: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    flex: 1
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
    fontWeight: "bold"
  },
  outerContainer: {
    flex: 1,
    backgroundColor: '#f9f9f9'
  },
  safeAreaView: {

  },
  scrollView: {
  }
});

export default HomeScreen;
