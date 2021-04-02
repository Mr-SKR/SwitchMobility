import React from 'react';
import { Text, StyleSheet, View, Image, ImageBackground, TouchableOpacity, Dimensions } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faHome, faUserCog, faUserFriends, faChartBar } from '@fortawesome/free-solid-svg-icons'


const ProfileScreen = ({ navigation }) => {
  
  return (
    <View style={styles.fullScreenViewStyle}>
      
      <View style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
        <Text>This is profile screen</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreenViewStyle: {
    flex: 1,
    flexDirection: "column-reverse"
  },
});

export default ProfileScreen;
