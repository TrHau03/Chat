import { Image, StyleSheet, Text, View } from 'react-native'
import React, { useContext } from 'react'
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { UseConText } from '../provider/Context';
import { Pressable } from 'react-native';
import { NativeStackHeaderProps } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { firebase } from '@react-native-firebase/auth';

const Profile = () => {
    const { userGoogle }: any = useContext(UseConText);
    const navigation = useNavigation<any>();
    const Logout = async () => {
        try {
            firebase.auth().currentUser?.delete();
            await GoogleSignin.revokeAccess();
            await GoogleSignin.signOut();
            return true;
        } catch (error) {
            console.error(error);
        }
    }
    return (
        <View style={{ alignItems: 'center', height: '100%', marginVertical: 20, rowGap: 10 }}>

            <Image style={{ width: 100, height: 100, borderRadius: 200 }} source={{ uri: userGoogle?.photo }} />
            <Text style={{ fontSize: 20, color: 'black' }}>{userGoogle.email}</Text>
            <Text>{userGoogle.name}</Text>
            <Pressable onPress={async () => await Logout() && navigation.navigate('Login')} style={{ position: 'absolute', alignSelf: 'center', bottom: 40, width: '90%', height: 50, backgroundColor: '#7ac3ff', borderRadius: 10, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 18, color: 'white' }}>Logout</Text>
            </Pressable>
        </View>
    )
}

export default Profile

const styles = StyleSheet.create({})

function auth() {
    throw new Error('Function not implemented.');
}
