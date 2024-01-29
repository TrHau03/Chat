import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useContext, useEffect } from 'react'
import LinearGradient from 'react-native-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import { UseConText } from '../provider/Context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackHeaderProps, NativeStackNavigationProp } from '@react-navigation/native-stack';


GoogleSignin.configure({
  webClientId: '668454287895-ha3ftquv5crq2b5n0g0gls40b9f7ik8f.apps.googleusercontent.com',
});
const Login = () => {
  const { socket, setUserGoogle, setKeyClient }: any = useContext(UseConText);
  const navigation = useNavigation<any>();
  useEffect(() => {
    const user = auth().currentUser;
    const userGoogle = {
      id: user?.uid,
      name: user?.displayName,
      email: user?.email,
      photo: user?.photoURL
    }

    if (user) {
      socket.emit('join', { name: user.displayName, avatar: user.photoURL, clientID: user.uid }, (e: any) => {
        setKeyClient(e);
      });
      setUserGoogle(userGoogle);
      setTimeout(() => {
        navigation.navigate('App');
      }, 2000);
    }
  }, [])


  async function onGoogleButtonPress() {
    // Check if your device supports Google Play
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    // Get the users ID token
    const userGoogle = await GoogleSignin.signIn();
    // Create a Google credential with the token
    const googleCredential = auth.GoogleAuthProvider.credential(userGoogle.idToken);
    userGoogle && setUserGoogle(userGoogle.user);
    socket.emit('join', { name: userGoogle.user.name, avatar: userGoogle.user.photo, clientID: userGoogle.user.id }, (e: any) => {
      setKeyClient(e);
    });
    // Sign-in the user with the credential
    return auth().signInWithCredential(googleCredential);
  }
  return (
    <View style={{ width: '100%', height: '100%', backgroundColor: '#0A1832', alignItems: 'center', paddingTop: 20, paddingHorizontal: 20 }}>
      <LinearGradient locations={[0, 0.5, 1]} start={{ x: 0, y: 1 }} end={{ x: 0, y: 0 }} colors={['#0A1832', '#43116A', '#0A1832']} style={styles.linearGradient}>
      </LinearGradient>

      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
        <Image style={{ width: 16, height: 20 }} source={require('../asset/image/logo.png')} />
        <Text style={{ color: '#ffffff', fontSize: 16 }}>Chatbox</Text>
      </View>
      <View style={{ width: '90%', marginTop: '20%', rowGap: 5 }}>
        <Text style={{
          color: 'white',
          fontSize: 68,
          fontWeight: '400',
          lineHeight: 78,
        }}>
          Connect friend
        </Text>
        <Text style={{
          color: 'white',
          fontSize: 68,
          fontWeight: '600',
          lineHeight: 78,
        }}>
          Easily & Quickly
        </Text>
        <Text style={{
          color: '#B9C1BE',
          fontSize: 16,
          fontWeight: '400',
          lineHeight: 26,
        }}>
          Our chat app is the perfect way to stay connected with friends and family.
        </Text>
      </View>
      <View style={{ marginTop: '20%', alignItems: 'center', rowGap: 10 }}>
        <Text style={{
          color: '#ffffff',
          fontSize: 20,
          fontWeight: '600',
        }}>Log in with</Text>
        <Pressable onPress={async () => { await onGoogleButtonPress() && navigation.navigate('App') }} style={{ borderWidth: 2, borderColor: '#ffffff', borderRadius: 50 }}>
          <Image style={{ width: 50, height: 50 }} source={require('../asset/image/GG.png')} />
        </Pressable>
      </View>
    </View>

  )
}

export default Login

const styles = StyleSheet.create({
  linearGradient: {
    position: 'absolute',
    right: -100,
    top: 100,
    width: '200%',
    paddingLeft: 15,
    paddingRight: 15,
    borderRadius: 150,
    height: 300,
    transform: [{ rotateZ: '-45deg' }],
  },
})