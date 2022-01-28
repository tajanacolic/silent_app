import React from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';

export default props => {
  const onLogout = () => {
    AsyncStorage.removeItem('locationList');
    AsyncStorage.removeItem('token');
    props.navigation.reset({
      routes: [{ name: 'Login' }],
    });
  };

  return (
    <View
      style={styles.container}
      onTouchStart={() => {
        props.navigation.navigate('Promjena zvuka');
      }}>
      <Text> Prijava uspješna </Text>
      <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Dobrodošli, {props.route.params.username}</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          props.navigation.navigate('Promjena zvuka');
        }}>
        <Text style={styles.buttontext}>Dalje</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={onLogout}>
        <Text style={styles.buttontext}>Odjava</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
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
