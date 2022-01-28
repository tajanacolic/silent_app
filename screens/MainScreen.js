import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TouchableWithoutFeedback, Keyboard } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import moment from 'moment';
import BackgroundGeolocation from '@mauron85/react-native-background-geolocation';

import SystemSetting from 'react-native-system-setting';
import { LocationListContext } from '../App';

// udaljenost za ugasiti ton - trenutno 50m
const DISTANCE_TO_MUTE = 50;

export default class MainScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isDatePickerVisible: false,
      isTimePickerVisible: false,
      selectedLocation: null,
      selectedDate: moment().format('DD.MM.YYYY'),
      selectedTime: moment().format('HH:mm'),
    };
  }

  componentDidMount() {
    this.startTracking();
  }

  startTracking = () => {
    BackgroundGeolocation.configure({
      desiredAccuracy: BackgroundGeolocation.HIGH_ACCURACY,
      stationaryRadius: 1,
      distanceFilter: 1,
      notificationTitle: 'Background tracking',
      notificationText: 'enabled',
      notificationsEnabled: false,
      debug: false,
      startOnBoot: false,
      stopOnTerminate: true,
      locationProvider: BackgroundGeolocation.ACTIVITY_PROVIDER,
      interval: 10000,
      fastestInterval: 5000,
      activitiesInterval: 10000,
      stopOnStillActivity: false,
    });

    BackgroundGeolocation.on('location', location => {
      this.onLocation(location);
      BackgroundGeolocation.startTask(taskKey => {
        BackgroundGeolocation.endTask(taskKey);
      });
    });

    BackgroundGeolocation.on('error', error => {
      // eslint-disable-next-line no-console
      console.log('[ERROR] BackgroundGeolocation error:', error);
    });

    BackgroundGeolocation.checkStatus(status => {
      if (!status.isRunning) {
        BackgroundGeolocation.start();
      }
    });
  };

  onLocation = location => {
    if (
      this.locationListArray &&
      this.locationListArray.length &&
      this.locationListArray.includes(moment().format('DD.MM.YYYY HH:mm'))
    ) {
      this.locationList.forEach(loc => {
        this.compareDistance(loc.selectedLocation, { latitude: location.latitude, longitude: location.longitude });
      });
    }
  };

  compareDistance = (selectedLocation, currentLocation) => {
    const lat1 = currentLocation.latitude;
    const lat2 = selectedLocation.latitude;
    const lon1 = currentLocation.longitude;
    const lon2 = selectedLocation.longitude;
    const unit = 'K';

    const radlat1 = (Math.PI * lat1) / 180;
    const radlat2 = (Math.PI * lat2) / 180;
    const theta = lon1 - lon2;
    const radtheta = (Math.PI * theta) / 180;
    let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    if (dist > 1) {
      dist = 1;
    }
    dist = Math.acos(dist);
    dist = (dist * 180) / Math.PI;
    dist = dist * 60 * 1.1515;
    if (unit === 'K') {
      dist *= 1.609344;
    }
    if (unit === 'N') {
      dist *= 0.8684;
    }
    dist *= 1000;
    // udaljenost trenutne lokacije je manja od preporučene, ugasiti zvuk
    if (dist < DISTANCE_TO_MUTE) {
      SystemSetting.setVolume(0);
    }
  };

  showDatePicker = () => {
    this.setState({ isDatePickerVisible: true });
  };

  showTimePicker = () => {
    this.setState({ isTimePickerVisible: true });
  };

  hideDatePicker = () => this.setState({ isDatePickerVisible: false });

  hideTimePicker = () => this.setState({ isTimePickerVisible: false });

  handleDatePicked = pickedDate => {
    this.setState({ selectedDate: moment(pickedDate).format('DD.MM.YYYY'), isDatePickerVisible: false });
  };

  handleTimePicked = pickedTime => {
    this.setState({ selectedTime: moment(pickedTime).format('HH:mm'), isTimePickerVisible: false });
  };

  onLocationSelect = data => {
    // 'details' is provided when fetchDetails = true
    fetch(
      // eslint-disable-next-line max-len
      `https://maps.googleapis.com/maps/api/geocode/json?address=${data.description}&key=AIzaSyDzNoDhms7d44hBYRMSCeC0UrSiw9fdk1k`,
    )
      .then(response => response.json())
      .then(response => {
        this.setState({
          selectedLocation: {
            name: data.structured_formatting.main_text,
            address: response.results[0].formatted_address,
            latitude: response.results[0].geometry.location.lat,
            longitude: response.results[0].geometry.location.lng,
          },
        });
      });
  };

  saveLocation = saveLocation => () => {
    const { selectedLocation, selectedDate, selectedTime } = this.state;
    saveLocation(selectedLocation, `${selectedDate} ${selectedTime}`);
    this.setState({
      selectedLocation: null,
      selectedDate: moment().format('DD.MM.YYYY'),
      selectedTime: moment().format('HH:mm'),
    });
    this.GooglePlacesRef.setAddressText('');
  };

  render() {
    return (
      <LocationListContext.Consumer>
        {({ locationList, locationListArray, saveLocation }) => {
          this.locationList = locationList;
          this.locationListArray = locationListArray;
          return (
            <View contentContainerStyle={{ flex: 1 }} style={styles.container}>
              <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <View>
                  <TouchableOpacity style={styles.input} onPress={this.showDatePicker}>
                    <Text>{this.state.selectedDate ? this.state.selectedDate.toString() : 'Odabir datuma'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.input} onPress={this.showTimePicker}>
                    <Text>{this.state.selectedTime ? this.state.selectedTime.toString() : 'Odabir vremena'}</Text>
                  </TouchableOpacity>
                  <DateTimePickerModal
                    isVisible={this.state.isDatePickerVisible}
                    onConfirm={this.handleDatePicked}
                    onCancel={this.hideDatePicker}
                    mode="date"
                    datePickerModeAndroid="spinner"
                    value={this.state.selectedDate}
                  />
                  <DateTimePickerModal
                    isVisible={this.state.isTimePickerVisible}
                    onConfirm={this.handleTimePicked}
                    onCancel={this.hideTimePicker}
                    mode="time"
                    datePickerModeAndroid="spinner"
                    value={this.state.selectedTime}
                  />
                </View>
              </TouchableWithoutFeedback>
              <TouchableOpacity style={styles.button} onPress={this.saveLocation(saveLocation)}>
                <Text style={styles.buttontext}>Spremi</Text>
              </TouchableOpacity>
              <View style={styles.googleplaces}>
                <GooglePlacesAutocomplete
                  ref={instance => {
                    this.GooglePlacesRef = instance;
                  }}
                  placeholder="Odabir lokacije"
                  onPress={this.onLocationSelect}
                  query={{
                    key: 'AIzaSyDzNoDhms7d44hBYRMSCeC0UrSiw9fdk1k',
                    language: 'hr',
                  }}
                  styles={{
                    textInputContainer: {
                      width: '100%',
                      backgroundColor: '#eaeaea',
                      borderTopWidth: 0,
                      borderBottomWidth: 0,
                      height: 55,
                    },
                    textInput: {
                      padding: 10,
                      height: 40,
                    },
                    description: {
                      fontWeight: 'bold',
                    },
                    predefinedPlacesDescription: {
                      color: '#1faadb',
                    },
                  }}
                />
              </View>
            </View>
          );
        }}
      </LocationListContext.Consumer>
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
  input: {
    backgroundColor: '#f2f2f2',
    borderRadius: 6,
    padding: 20,
    marginBottom: 10,
    width: 300,
  },
  googleplaces: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 200,
    padding: 10,
    marginTop: 10,
    backgroundColor: '#2f4596',
  },
  buttontext: {
    color: 'white',
  },
});
