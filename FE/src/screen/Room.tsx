import { FlatList, ListRenderItemInfo, Modal, Pressable, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import io from 'socket.io-client';
import { UseConText } from '../provider/Context';
import { NativeStackHeaderProps } from '@react-navigation/native-stack';
import { SceneMap, TabView } from 'react-native-tab-view';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';






const Room = (prop: any) => {
    const { navigation }: NativeStackHeaderProps = prop;
    const layout = useWindowDimensions();
    const [index, setIndex] = useState<number>(0);
    const [routes] = useState([
        { key: 'first', title: 'ListRoom' },
        { key: 'second', title: 'ListChat' },
    ]);

    const { socket }: any = useContext(UseConText);
    const [listRoom, setListRoom] = useState<any>([]);
    const [listUser, setListUser] = useState<any>([]);
    const [nameRoom, setNameRoom] = useState<string>('');
    const [keyClient, setKeyClient] = useState<string>();
    useEffect(() => {
        socket.emit('findAllRoom', (e: any) => {
            setListRoom(e);
        })
        socket.emit('findAllUser', (e: any) => {
            setListUser(Object.values(e));
        })
        socket.on('room', (e: any) => {
            setListRoom((prevRoom: any) => [...prevRoom, e])
        })
        return () => { }
    }, [])


    const handleCreateRoom = () => {
        socket.emit('createRoom', { roomID: listRoom?.length + 1, nameRoom: nameRoom });
        setNameRoom('');
    }
    const handleJoinChat = () => {
        socket.emit('join', { name: userName }, (e: any) => {
            setKeyClient(e);
        });
    };
    const [modalVisible, setModalVisible] = useState<boolean>(true);
    const [userName, setUserName] = useState<string>('');


    const ListRoom = () => {
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
                                <Pressable onPress={() => navigation.navigate('Chat', { keyClient, roomID: item.roomID, userName })} style={{ width: '100%', borderWidth: 0.5, paddingVertical: 5, justifyContent: 'center', alignItems: 'center', borderRadius: 5 }}>
                                    <Text>{item?.nameRoom}</Text>
                                </Pressable>
                            )
                        }} />
                </View>
            </View>
        )
    }
    const ListChat = () => {
        return (
            <View>
                <View style={{ justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                    <Text style={{ fontSize: 20, fontWeight: 'bold' }}>ListUser</Text>
                    <FlatList
                        style={{ width: '80%' }}
                        contentContainerStyle={{ justifyContent: 'center' }}
                        data={listUser}
                        renderItem={({ item }: any) => {
                            return (
                                <Pressable onPress={() => navigation.navigate('Chat', { keyClient, roomID: item.roomID, userName })} style={{ width: '100%', borderWidth: 0.5, paddingVertical: 5, justifyContent: 'center', alignItems: 'center', borderRadius: 5 }}>
                                    <Text>{item}</Text>
                                </Pressable>
                            )
                        }} />
                </View>
            </View>
        )
    }
    const renderScene = SceneMap({
        first: ListRoom,
        second: ListChat,
    });
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
                        <TextInput
                            value={userName}
                            onChangeText={setUserName}
                            style={{ width: '80%', borderRadius: 10, borderWidth: 1, alignSelf: 'center' }}
                            placeholder='Enter your name '
                        />
                        <Pressable
                            onPress={() => {
                                userName !== '' && setModalVisible(false);
                                handleJoinChat()
                            }}
                            style={{
                                width: '80%',
                                height: '5%',
                                backgroundColor: '#dfdfdf',
                                alignSelf: 'center',
                                justifyContent: 'center',
                                borderRadius: 5
                            }}
                        >
                            <Text style={{ textAlign: 'center', fontSize: 20 }}>Join this app</Text>
                        </Pressable>
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