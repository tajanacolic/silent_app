import React from 'react';
import { FlatList, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { LocationListContext } from '../App';

export default class LocationListScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  renderItem = (item, removeLocation, index) => (
    <View style={styles.location}>
      <Text style={styles.title}>{item.selectedLocation.name}</Text>
      <Text style={styles.locationtext}>{item.selectedLocation.address}</Text>
      <Text style={styles.locationtext}>Vrijeme: {item.selectedDateTime}</Text>
      <TouchableOpacity style={styles.button} onPress={removeLocation(index)}>
        <Text style={styles.buttontext}>Ukloni</Text>
      </TouchableOpacity>
    </View>
  );

  renderEmpty = () => (
    <View style={styles.empty}>
      <Text style={styles.emptytext}>Lokacija nije dodana</Text>
    </View>
  );

  render() {
    return (
      <LocationListContext.Consumer>
        {({ locationList, removeLocation }) => (
          <View style={styles.container}>
            <FlatList
              data={locationList}
              renderItem={({ item, index }) => this.renderItem(item, removeLocation, index)}
              keyExtractor={item => item.selectedDateTime}
              ListEmptyComponent={() => this.renderEmpty()}
            />
          </View>
        )}
      </LocationListContext.Consumer>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  location: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  locationtext: {
    paddingTop: 10,
  },
  datetime: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 130,
    paddingTop: 10,
    paddingBottom: 10,
    marginTop: 10,
    backgroundColor: '#2f4596',
  },
  buttontext: {
    color: 'white',
  },
  empty: {
    paddingTop: 100,
  },
  emptytext: {
    textAlign: 'center',
  },
});
