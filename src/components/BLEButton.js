import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';

function BLEButton({onPress, title}) {
  return (
    <View style={styles.centerContents}>
      <TouchableOpacity style={styles.button} onPress={onPress}>
        <Text style={{color: '#000000'}}>{title}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    height: 50,
    width: 100,
    backgroundColor: '#ffffff',
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#000000',
    justifyContent: 'center',
    padding: 10,
  },
  centerContents: {
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    justifyContent: 'center',
    height: 100,
  },
});

export default BLEButton;
