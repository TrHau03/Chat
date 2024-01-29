import { Button, FlatList, Image, ListRenderItemInfo, Modal, Pressable, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import io from 'socket.io-client';
import { UseConText } from '../provider/Context';
import { NativeStackHeaderProps } from '@react-navigation/native-stack';
import { SceneMap, TabView } from 'react-native-tab-view';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';


GoogleSignin.configure({
    webClientId: '668454287895-ha3ftquv5crq2b5n0g0gls40b9f7ik8f.apps.googleusercontent.com',
});


const Room = (prop: any) => {
    const { navigation }: NativeStackHeaderProps = prop;
    const layout = useWindowDimensions();
    const [index, setIndex] = useState<number>(0);
    const [routes] = useState([
        { key: '1', title: 'ListRoom' },
        { key: '2', title: 'ListChat' },
        { key: '3', title: 'Profile' },
    ]);
    let listTemp: any;
    const { socket }: any = useContext(UseConText);
    const [keyClient, setKeyClient] = useState<string>();
    const [modalVisible, setModalVisible] = useState<boolean>(true);
    const [userName, setUserName] = useState<string | null>('');
    const [userGoogle, setUserGoogle] = useState<{ email: string, name: string, photo: string } | any>();
    const ListRoom = () => {
        const isFocus = useIsFocused();

        const [listRoom, setListRoom] = useState<any>([]);
        const [nameRoom, setNameRoom] = useState<string>('');
        useEffect(() => {
            if (isFocus) {
                socket.emit('findAllRoom', { clientID: keyClient }, (e: any) => {
                    setListRoom(e);
                })
                socket.on('room', (e: any) => {
                    e.userID.includes(keyClient) && setListRoom((prevRoom: any) => [...prevRoom, e])
                })
                socket.on('roomUpdate', (e: any) => {
                    e.userID.includes(keyClient) && setListRoom((prevRoom: any) => [...prevRoom, e])
                })
            }
            return () => { }
        }, [isFocus])
        const handleCreateRoom = () => {
            nameRoom != '' && socket.emit('createRoom', { roomID: listRoom?.length + 1, nameRoom: nameRoom, userID: [keyClient] });
            setNameRoom('');
        }
        return (
            <View>
                
                <View style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '100%', height: 'auto', rowGap: 10 }}>
                    <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Create room</Text>
                    <TextInput style={{ borderWidth: 0.5, borderRadius: 5, width: '80%', paddingVertical: 5 }} placeholder='NameRoom' value={nameRoom} onChangeText={setNameRoom} />
                    <Pressable onPress={handleCreateRoom} style={{ width: '80%', height: 40, justifyContent: 'center', alignItems: 'center', backgroundColor: '#494949', borderRadius: 5 }}>
                        <Text style={{ color: '#fff' }}>CreateRoom</Text>
                    </Pressable>
                </View>
                <View style={{ justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                    <Text style={{ fontSize: 20, fontWeight: 'bold' }}>ListRoom</Text>
                    <FlatList
                        style={{ width: '80%' }}
                        contentContainerStyle={{ justifyContent: 'center' }}
                        data={listRoom}
                        renderItem={({ item }: ListRenderItemInfo<{
                            roomID: string;
                            nameRoom: string;
                        }>) => {
                            return (
                                <Pressable onPress={() => navigation.navigate('Chat', { keyClient, roomID: item.roomID, userName, title: item.nameRoom })} style={{ width: '100%', borderWidth: 0.5, paddingVertical: 5, justifyContent: 'center', alignItems: 'center', borderRadius: 5 }}>
                                    <Text>{item?.nameRoom}</Text>
                                </Pressable>
                            )
                        }} />
                </View>
            </View>
        )
    }
    const ListChat = () => {
        const [listUser, setListUser] = useState<any>([]);
        const isFocus = useIsFocused();
        useEffect(() => {
            if (isFocus) {
                socket.emit('findAllUser', (e: any) => {
                    listTemp = e;
                    setListUser(Object.values(e));
                })
            }
        }, [isFocus])
        return (
            <View>
                <View style={{ justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                    <Text style={{ fontSize: 20, fontWeight: 'bold' }}>ListUser</Text>
                    <FlatList
                        style={{ width: '80%' }}
                        contentContainerStyle={{ justifyContent: 'center' }}
                        data={listUser.filter((user: any) => user != userName)}
                        renderItem={({ item }: any) => {
                            const key = Object.keys(listTemp).find((user: any) => listTemp[user] == item)
                            return (
                                <Pressable onPress={() => navigation.navigate('Chat11', { keyClient, user: key, userName, title: item })} style={{ width: '100%', borderWidth: 0.5, paddingVertical: 5, justifyContent: 'center', alignItems: 'center', borderRadius: 5 }}>
                                    <Text>{item}</Text>
                                </Pressable>
                            )
                        }} />
                </View>
            </View>
        )
    }
    const Profile = () => {
        const Logout = async () => {
            try {
                await GoogleSignin.revokeAccess();
                await GoogleSignin.signOut();
                auth().signOut();
                setModalVisible(true);
            } catch (error) {
                console.error(error);
            }
        }
        return (
            <View style={{ alignItems: 'center', height: '100%', marginVertical: 20, rowGap: 10 }}>

                <Image style={{ width: 100, height: 100, borderRadius: 200 }} source={{ uri: userGoogle.photo }} />
                <Text style={{ fontSize: 20, color: 'black' }}>{userGoogle.email}</Text>
                <Text>{userGoogle.name}</Text>
                <Pressable onPress={() => Logout()} style={{ position: 'absolute', alignSelf: 'center', bottom: 40, width: '90%', height: 50, backgroundColor: '#7ac3ff', borderRadius: 10, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ fontSize: 18, color: 'white' }}>Logout</Text>
                </Pressable>
            </View>
        )
    }
    const renderScene = SceneMap({
        1: ListRoom,
        2: ListChat,
        3: Profile,
    });
    async function onGoogleButtonPress() {
        // Check if your device supports Google Play
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
        // Get the users ID token
        const userGoogle = await GoogleSignin.signIn();
        // Create a Google credential with the token
        const googleCredential = auth.GoogleAuthProvider.credential(userGoogle.idToken);
        userGoogle && setUserName(userGoogle.user.name);
        userGoogle && setUserGoogle(userGoogle.user);
        socket.emit('join', { name: userGoogle.user.name }, (e: any) => {
            setKeyClient(e);
        });
        // Sign-in the user with the credential
        return auth().signInWithCredential(googleCredential);
    }
    return (
        (modalVisible) ?
            <SafeAreaView>
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                >
                    <View
                        style={{
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            backgroundColor: '#ffffff',
                            width: '100%',
                            height: '100%',
                            gap: 10
                        }}
                    >

                        <Button
                            title="Google Sign-In"
                            onPress={() => onGoogleButtonPress().then(() => { console.log('Signed in with Google!'); setModalVisible(false) })}
                        />
                    </View>
                </Modal>
            </SafeAreaView> :
            <TabView
                navigationState={{ index, routes }}
                renderScene={renderScene}
                onIndexChange={setIndex}
                initialLayout={{ width: layout.width }}
            />

    )
}

export default Room

const styles = StyleSheet.create({})