// IMPORT PACKAGES
import 'react-native-gesture-handler';
import * as React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {
  faHome,
  faUserCog,
  faUserFriends,
  faChartBar,
} from '@fortawesome/free-solid-svg-icons';

// IMPORT SCREENS
import HomeScreen from '../screens/HomeScreen';
import SettingsScreen from '../screens/SettingsScreen';
import StatisticsScreen from '../screens/StatisticsScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MyTab() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      tabBarOptions={{
        activeTintColor: '#ff0000',
        activeTintSize: 32,
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({color, size}) => (
            <FontAwesomeIcon icon={faHome} color={color} size={32} />
          ),
        }}
      />
      <Tab.Screen
        name="Stats"
        component={StatisticsScreen}
        options={{
          tabBarLabel: 'Stats',
          tabBarIcon: ({color, size}) => (
            <FontAwesomeIcon icon={faChartBar} color={color} size={32} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({color, size}) => (
            <FontAwesomeIcon icon={faUserFriends} color={color} size={32} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({color, size}) => (
            <FontAwesomeIcon icon={faUserCog} color={color} size={32} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const Navigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Tabs"
      screenOptions={{headerShown: false}}>
      <Stack.Screen
        component={MyTab}
        name="Tabs"
        options={{title: 'Switch Mobility'}}
      />
    </Stack.Navigator>
  );
};

export default Navigator;
