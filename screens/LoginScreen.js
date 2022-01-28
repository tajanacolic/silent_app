import React, { Component } from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { GoogleSignin } from '@react-native-community/google-signin';
import AsyncStorage from '@react-native-community/async-storage';

const IOS_CLIENT_ID = '419820643121-96s58ll49l0vuel3t3rrmimr3hd5q5fk.apps.googleusercontent.com';
const ANDROID_CLIENT_ID = '419820643121-gs4glnih1385623skrhu16uj8k0a2rld.apps.googleusercontent.com';

export default class LoginScreen extends Component {
  signInWithGoogle = async () => {
    GoogleSignin.configure({
      iosClientId: IOS_CLIENT_ID,
      androidClientId: ANDROID_CLIENT_ID,
      webClientId: ANDROID_CLIENT_ID,
      offlineAccess: true,
    });
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      AsyncStorage.setItem('token', userInfo.idToken);
      this.props.navigation.navigate('Profile', {
        username: userInfo.user.givenName,
      }); // after Google login redirect to Profile
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
    }
  };

  render() {
    return (
      <View style={styles.container}>
        <Text style={{ fontSize: 30, fontWeight: 'bold' }}>Prijava</Text>
        <TouchableOpacity style={styles.button} onPress={this.signInWithGoogle}>
          <Text style={styles.buttontext}>Prijava s Google računom</Text>
        </TouchableOpacity>
      </View>
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
