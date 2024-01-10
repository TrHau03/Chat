import { Button, Image, Modal, PermissionsAndroid, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client';
import { UseConText } from '../provider/Context';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import uuid from 'react-native-uuid';
import storage from '@react-native-firebase/storage';
const Chat11 = (prop: any) => {
    const { keyClient, user, userName, title } = prop.route.params;
    const { socket }: any = useContext(UseConText);
    const [messages, setMessages] = useState<any>();
    const [messageText, setMessageText] = useState<string>();
    const [typingDisplay, setTypingDisplay] = useState<string>();
    const [roomInfo, setRoomInfo] = useState<any | undefined>();

    const [modalVisible, setModalVisible] = useState<boolean>(false);
    useEffect(() => {
        socket.emit('createRoomByUser', { roomID: uuid.v4(), userID: [keyClient, user] }, (e: any) => {
            setRoomInfo(e);
            setMessages(e.messages);
            socket.on('typing', ({ name, isTyping, roomIDTyping }: any) => {
                if (isTyping) {
                    name != userName && roomIDTyping == e?.roomID && setTypingDisplay(`${name} is typing`);
                } else {
                    setTypingDisplay('');
                }
            });
        });
    }, []);

    useEffect(() => {
        socket.on('messagesByUser', (newMessage: any) => {
            setMessages((prevMessages: any) => [...prevMessages, newMessage]);
        });
        
    }, []);



    const handleTyping = () => {
        socket.emit('typing', { isTyping: true, keyClient: keyClient, roomIDTyping: roomInfo.roomID });
        setTimeout(() => {
            socket.emit('typing', { isTyping: false, keyClient: keyClient, roomIDTyping: roomInfo.roomID });
        }, 1000);
    };
    const sendMessage = (messageText: string | undefined) => {
        // Gửi tin nhắn lên máy chủ thông qua Socket.IO
        if (socket) {
            socket.emit('createMessageByUser', { roomID: roomInfo.roomID, clientID: keyClient, text: messageText });
            setMessageText('');
        }
    };

    // const requestCameraPermission = async () => {
    //     try {
    //         const granted = await PermissionsAndroid.request(
    //             PermissionsAndroid.PERMISSIONS.CAMERA,
    //         );
    //         if (granted === PermissionsAndroid.RESULTS.GRANTED) {
    //             const result: any = await launchCamera({
    //                 mediaType: 'photo',
    //                 cameraType: 'front',
    //             });
    //             const object = { id: image.length + 1, img: result.assets[0].uri };
    //             image.push(object);

    //         } else {
    //             console.log('Từ chối');
    //         }
    //     } catch (error) {
    //         console.log(error);
    //     }
    // };

    //Camera
    const reference = storage().ref(`${uuid.v4()}.jpg`);
    const requestCameraPermissionPhoto = async () => {
        try {
            console.log('Camera Ok');
            //Mở thư viện ảnh
            const result: any = await launchImageLibrary({ mediaType: 'photo' });
            console.log(result.assets[0].uri);
            await reference.putFile(result.assets[0].uri);
            const url = await reference.getDownloadURL();
            sendMessage(url);

        } catch (error) {
            console.log(error);
        }
    };
    return (
        <View style={{ height: '100%', paddingTop: 20 }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', textAlign: 'center' }}>{title}</Text>
            {
                messages?.map((item: any, index: number) => {
                    return (
                        (item.name == userName) ?
                            <View key={index} style={{ alignSelf: 'flex-end', marginRight: 10, marginBottom: 5 }}>
                                {item.text.includes('https://firebasestorage.googleapis.com') ?
                                    <View>
                                        <Pressable onPress={() => setModalVisible(true)}>
                                            <Image style={{ width: 120, height: 100, borderRadius: 5 }} source={{ uri: item.text }} />
                                        </Pressable>
                                        
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
                                                <Pressable style={{ zIndex: 1, position: 'absolute' }} onPress={() => setModalVisible(false)}>
                                                    <Text style={{ fontSize: 20 }}>X</Text>
                                                </Pressable>
                                                <Image style={{ width: '100%', height: '100%', borderRadius: 5 }} source={{ uri: item.text }} />
                                            </View>
                                        </Modal>
                                    </View>
                                    :
                                    <Text style={{ fontSize: 20, maxWidth: '80%', borderRadius: 10, borderWidth: 0.5, paddingHorizontal: 5 }} >{item.text}</Text>
                                }
                            </View>
                            :
                            <View key={index} style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', marginBottom: 5 }}>
                                <View style={{ width: 30, height: 30, backgroundColor: '#b7b7b7', borderRadius: 50, marginLeft: 10, marginRight: 5 }}></View>
                                <View style={{ maxWidth: '80%' }}>
                                    <Text style={{ fontSize: 16 }}>{item.name}</Text>
                                    {item.text.includes('https://firebasestorage.googleapis.com') ?

                                        <View>
                                            <Pressable onPress={() => setModalVisible(true)}>
                                                <Image style={{ width: 120, height: 100, borderRadius: 5 }} source={{ uri: item.text }} />
                                            </Pressable>
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
                                                    <Pressable style={{ zIndex: 1, position: 'absolute' }} onPress={() => setModalVisible(false)}>
                                                        <Text style={{ fontSize: 20 }}>X</Text>
                                                    </Pressable>
                                                    <Image style={{ width: '100%', height: '100%', borderRadius: 5 }} source={{ uri: item.text }} />
                                                </View>
                                            </Modal>
                                        </View>
                                        :
                                        <Text style={{ fontSize: 20, borderRadius: 10, borderWidth: 0.5, paddingHorizontal: 5 }} >{item.text}</Text>
                                    }
                                </View>
                            </View>
                    )
                })
            }
            <View style={{ position: 'absolute', width: '100%', bottom: 20 }}>
                <Text style={{ fontSize: 20 }}>{typingDisplay}</Text>
                <View style={{ borderWidth: 0.5, width: '95%', flexDirection: 'row', borderRadius: 10, marginHorizontal: 5, alignSelf: 'center' }}>
                    <TextInput
                        style={{ backgroundColor: '#fafafa', width: '70%' }}
                        value={messageText}
                        onChange={(e) => setMessageText(e.nativeEvent.text)}
                        onChangeText={handleTyping}
                    />
                    <Pressable
                        onPress={() => {
                            requestCameraPermissionPhoto();
                        }}
                        style={{ borderWidth: 1, width: '15%', justifyContent: 'center', alignItems: 'center', borderTopLeftRadius: 10, borderBottomLeftRadius: 10 }}
                    >
                        <Text>Ảnh</Text>
                    </Pressable>
                    <Pressable
                        onPress={() => {
                            sendMessage(messageText);
                        }}
                        style={{ borderWidth: 1, width: '15%', justifyContent: 'center', alignItems: 'center', borderTopRightRadius: 10, borderBottomRightRadius: 10 }}
                    >
                        <Text>Gửi</Text>
                    </Pressable>
                </View>
            </View>

        </View>
    )
}

export default Chat11

const styles = StyleSheet.create({})