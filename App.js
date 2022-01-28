import React, { Component } from 'react';
import AsyncStorage from '@react-native-community/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Text, TouchableOpacity } from 'react-native';

import LoginScreen from './screens/LoginScreen';
import ProfileScreen from './screens/ProfileScreen';
import MainScreen from './screens/MainScreen';
import LocationListScreen from './screens/LocationListScreen';

MaterialCommunityIcons.loadFont();

export const LocationListContext = React.createContext({ locationList: [], saveLocation: () => {} });

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const Home = () => (
  <Tab.Navigator
    tabBarOptions={{
      activeTintColor: '#2f4596',
    }}>
    <Tab.Screen
      name="Home"
      component={MainScreen}
      showIcon={false}
      options={{
        tabBarLabel: 'Home',
        tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="home" color={color} size={size} />,
      }}
    />
    <Tab.Screen
      name="Lokacije"
      component={LocationListScreen}
      options={{
        tabBarLabel: 'Lokacije',
        tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="view-headline" color={color} size={size} />,
      }}
    />
  </Tab.Navigator>
);

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      locationList: [],
      locationListArray: [],
      screen: '',
    };
  }

  componentDidMount() {
    this.checkLogin();
  }

  checkLogin = async () => {
    let locationList = await AsyncStorage.getItem('locationList');
    const locationListArray = [];
    if (locationList) {
      locationList = JSON.parse(locationList);
      locationList.forEach(location => {
        locationListArray.push(location.selectedDateTime);
      });
    }
    const token = await AsyncStorage.getItem('token');
    this.setState({
      locationList: locationList || [],
      locationListArray,
      screen: token ? 'Promjena zvuka' : 'Login',
    });
  };

  saveLocation = (selectedLocation, selectedDateTime) => {
    if (selectedLocation && selectedDateTime) {
      const { locationList, locationListArray } = this.state;
      locationList.push({ selectedLocation, selectedDateTime });
      locationListArray.push(selectedDateTime);
      this.setState({ locationList, locationListArray });
      AsyncStorage.setItem('locationList', JSON.stringify(locationList));
    }
  };

  removeLocation = index => () => {
    const { locationList } = this.state;
    locationList.splice(index, 1);
    this.setState({ locationList });
    AsyncStorage.setItem('locationList', JSON.stringify(locationList));
  };

  render() {
    if (!this.state.screen) {
      return null;
    }
    return (
      <LocationListContext.Provider
        value={{
          locationList: this.state.locationList,
          locationListArray: this.state.locationListArray,
          saveLocation: this.saveLocation,
          removeLocation: this.removeLocation,
        }}>
        <NavigationContainer>
          <Stack.Navigator initialRouteName={this.state.screen}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen
              name="Promjena zvuka"
              component={Home}
              options={({ navigation }) => ({
                headerRight: () => (
                  <TouchableOpacity
                    style={{ padding: 10 }}
                    onPress={() => {
                      AsyncStorage.removeItem('locationList');
                      AsyncStorage.removeItem('token');
                      navigation.reset({
                        routes: [{ name: 'Login' }],
                      });
                    }}>
                    <Text>Odjava</Text>
                  </TouchableOpacity>
                ),
              })}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </LocationListContext.Provider>
    );
  }
}
