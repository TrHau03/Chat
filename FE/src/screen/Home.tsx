import { AppState, FlatList, Image, Modal, Pressable, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { SceneMap, TabView } from 'react-native-tab-view';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'

import { UseConText } from '../provider/Context';
import Messages from './Message';
import Group from './Group';

const Home = () => {
    const { width, height } = useWindowDimensions();
    const { socket, keyClient, userGoogle }: any = useContext(UseConText);

    const [index, setIndex] = useState<number>(0);
    const [listActive, setListActive] = useState<[]>();
    const [myActive, setMyActive] = useState<{ name: string, status: string, avatar: string }>();
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [status, setStatus] = useState<string>();
    const [routes] = useState([
        { key: '1', title: 'Message' },
        { key: '2', title: 'Group' },
    ]);
    const renderScene = SceneMap({
        1: Messages,
        2: Group,
    });
    const appState = useRef(AppState.currentState);
    useEffect(() => {
        const subscription = AppState.addEventListener('change', nextAppState => {
            if (
                appState.current.match(/inactive|background/) &&
                nextAppState === 'active'
            ) {
                console.log('App has come to the foreground!');
            }
            appState.current = nextAppState;
            if (appState.current == 'active') {
                setTimeout(() => {
                    keyClient && socket.emit('status', { keyClient: keyClient, avatar: userGoogle.photo, name: userGoogle.name, active: true });
                }, 2000);
            } else {
                keyClient && socket.emit('status', { keyClient: keyClient, active: false });
            }
        });

        return () => {
            subscription.remove();
        };
    }, [appState]);
    useEffect(() => {
        setTimeout(() => {
            keyClient && socket.emit('status', { keyClient: keyClient, avatar: userGoogle.photo, name: userGoogle.name, active: true })
        }, 2000);
        socket?.on('listActive', (e: any) => {
            setMyActive(e.find((active: any) => active.clientID == keyClient));
            setListActive(e);
        })
    }, [])
    const addStatus = () => {
        keyClient && socket.emit('status', { keyClient: keyClient, avatar: userGoogle.photo, name: userGoogle.name, active: true, status: status });
    }
    const deleteStatus = () => {
        keyClient && socket.emit('status', { keyClient: keyClient, avatar: userGoogle.photo, name: userGoogle.name, active: true, status: '' });
    }
    return (
        <View style={{ backgroundColor: 'black', height: height, paddingHorizontal: 15 }}>
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
                        backgroundColor: 'black',
                        width: '100%',
                        height: '100%',
                        gap: 10,
                        paddingHorizontal: 20,
                        paddingVertical: 15
                    }}
                >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Pressable onPress={() => setModalVisible(false)}>
                            <MaterialIcons name='close' size={35} color={'green'} />
                        </Pressable>
                        <Text style={{ color: 'white', fontSize: 25, fontWeight: 'bold' }}>Share your status</Text>
                        <Pressable onPress={() => { addStatus(); setModalVisible(false); setStatus('') }}>
                            <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>Share</Text>
                        </Pressable>
                    </View>
                    <View style={{ alignItems: 'center', marginTop: 30 }}>
                        <View style={{ position: 'absolute' }}>
                            <TextInput maxLength={60} value={status} onChangeText={setStatus} placeholder='Your Status' style={{ borderWidth: 1, borderColor: 'gray', borderRadius: 20, paddingVertical: 20, paddingHorizontal: 15, backgroundColor: 'gray', width: 250 }} />
                            <View style={{ width: 20, height: 20, borderRadius: 20, backgroundColor: 'gray', position: 'relative', left: 20, bottom: 10 }}></View>
                        </View>
                        <Image source={{ uri: userGoogle.photo }} style={{ width: 100, height: 100, borderRadius: 100, marginTop: 75 }} />
                    </View>
                    {myActive?.status &&
                        <Pressable onPress={() => { deleteStatus(); setModalVisible(false) }} style={{ width: '100%', height: 50, backgroundColor: 'red', justifyContent: 'center', alignItems: 'center', borderRadius: 20, marginTop: 20 }}>
                            <Text style={{ color: 'white', fontSize: 25 }}>Delete Status</Text>
                        </Pressable>
                    }
                </View>
            </Modal>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 }}>
                <View></View>
                <Text style={{ color: 'white', fontSize: 25, fontWeight: 'bold', textAlign: 'center', marginLeft: 30 }}>Home</Text>
                <Image style={{ width: 40, height: 40, borderRadius: 50 }} source={{ uri: userGoogle.photo }} />
            </View>
            <View style={{ flexDirection: 'row' }}>
                {myActive &&
                    <Pressable onPress={() => setModalVisible(true)} style={{ marginLeft: 8, marginTop: 40, flexDirection: 'column', alignItems: 'center' }}>
                        <View style={{ height: 70 }}>
                            {myActive.status != '' &&
                                <Text style={{ position: 'absolute', color: 'white', zIndex: 1, backgroundColor: 'gray', alignSelf: 'center', borderRadius: 5, top: -30, padding: 5 }}>{myActive.status}</Text>
                            }
                            <Image style={{ width: 70, height: 70, borderRadius: 70 }} source={{ uri: myActive.avatar }} />
                            <View style={{ position: 'absolute', bottom: 0, right: -2, backgroundColor: 'white', borderRadius: 25 }}>
                                <MaterialIcons name='add' size={20} color={'black'} />
                            </View>
                        </View>
                        <Text style={{ color: 'white' }}>{myActive.name.length < 10 ? myActive.name : userGoogle.name.slice(0, 10)}</Text>
                    </Pressable>
                }
                <FlatList
                    horizontal
                    data={listActive ? listActive.filter((user: any) => user.clientID != keyClient) : null}
                    keyExtractor={(item: any) => item.clientID.toString()}
                    renderItem={({ item }: any) => {

                        return <View style={{ marginLeft: 8, marginTop: 40, flexDirection: 'column', alignItems: 'center' }}>
                            <View style={{ height: 70 }}>
                                {item.status &&
                                    <Text style={{ position: 'absolute', color: 'white', zIndex: 1, backgroundColor: 'gray', alignSelf: 'center', borderRadius: 5, top: -30, padding: 5 }}>{item.status}</Text>
                                }
                                <Image style={{ width: 70, height: 70, borderRadius: 70 }} source={{ uri: item.avatar }} />
                                <View style={{ width: 15, height: 15, borderRadius: 15, backgroundColor: 'green', position: 'absolute', bottom: 3, right: 3 }}></View>
                            </View>
                            <Text style={{ color: 'white' }}>{item.name.length < 10 ? item.name : item.name.slice(0, 10) + '...'}</Text>
                        </View>
                    }}
                />
            </View>
            <View style={{ position: 'absolute', bottom: 0, width: width, height: height * 0.75, backgroundColor: 'white', borderTopLeftRadius: 30, borderTopRightRadius: 30 }}>
                <TabView
                    swipeEnabled
                    navigationState={{ index, routes }}
                    renderScene={renderScene}
                    onIndexChange={setIndex}
                    initialLayout={{ width: width }}
                />
            </View>
        </View >
    )
}

export default Home

const styles = StyleSheet.create({})