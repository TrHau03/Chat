import { Button, FlatList, Image, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client';
import { UseConText } from '../provider/Context';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import uuid from 'react-native-uuid';
import storage from '@react-native-firebase/storage';
import BouncyCheckbox from "react-native-bouncy-checkbox";
import Video from 'react-native-video';
const Chat = (prop: any) => {
    const { keyClient, roomID, userName, title } = prop.route.params;

    const { socket }: any = useContext(UseConText);
    const [messages, setMessages] = useState<any>();
    const [messageText, setMessageText] = useState<string>();
    const [typingDisplay, setTypingDisplay] = useState<string>();
    const [listUser, setListUser] = useState<any>();
    const [listUserAdd, setListUserAdd] = useState<any>();
    const [modalVisibleUser, setModalVisibleUser] = useState<boolean>(false);
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [modalVisibleVideo, setModalVisibleVideo] = useState<boolean>(false);
    const [urlModal, setUrlModal] = useState<string>('');
    const [urlModalVideo, setUrlModalVideo] = useState<string>('');
    useEffect(() => {
        socket.emit('findAllMessages', { roomID }, (e: any) => {
            const newMess: any = []
            e?.map((item: any) => {
                return item.messages.map((message: any) => {
                    newMess?.push(message)
                });
            });
            setMessages(newMess);
        });
        socket.emit('findAllUser', (e: any) => {
            const key = Object.keys(e);
            key?.map((key) => {
                setListUser((pre: any) => pre ? [...pre, { userID: key, name: e[key] }] : [{ userID: key, name: e[key] }])
            })
        });
    }, []);

    useEffect(() => {
        socket.on('messages', (newMessage: any) => {
            roomID == newMessage.roomID && setMessages((prevMessages: any) => [...prevMessages, newMessage.messages]);
        });
        socket.on('typing', ({ name, isTyping, roomIDTyping }: any) => {
            if (isTyping) {
                name != userName && roomIDTyping == roomID && setTypingDisplay(`${name} is typing`);
            } else {
                setTypingDisplay('');
            }
        });
    }, []);

    const AddUser = async () => {
        listUserAdd != null && socket.emit('updateUserRoom', { roomID, userID: listUserAdd });
    }

    const handleTyping = () => {
        socket.emit('typing', { isTyping: true, keyClient: keyClient, roomIDTyping: roomID });
        setTimeout(() => {
            socket.emit('typing', { isTyping: false, keyClient: keyClient, roomIDTyping: roomID });
        }, 1000);
    };
    const sendMessage = (messageText: string | undefined) => {
        // Gửi tin nhắn lên máy chủ thông qua Socket.IO
        if (socket) {
            socket.emit('createMessage', { roomID: roomID, clientID: keyClient, text: messageText });
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
    const requestCameraPermissionPhoto = async () => {
        try {
            console.log('Camera Ok');
            //Mở thư viện ảnh
            const result: any = await launchImageLibrary({ mediaType: 'mixed' });
            const reference = storage().ref(result.assets[0].uri.includes('.mp4') ? `${uuid.v4()}.mp4` : `${uuid.v4()}.jpg`);
            await reference.putFile(result.assets[0].uri);
            const url = await reference.getDownloadURL();
            sendMessage(url);

        } catch (error) {
            console.log(error);
        }
    };
    return (
        <View style={{ height: '100%', paddingTop: 20 }}>
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
                    <Pressable style={{ zIndex: 1, position: 'absolute' }} onPress={() => { setModalVisible(false); setUrlModal('') }}>
                        <Text style={{ fontSize: 20 }}>X</Text>
                    </Pressable>
                    <Image style={{ width: '100%', height: '100%', borderRadius: 5 }} source={{ uri: urlModal }} />
                </View>
            </Modal>
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisibleVideo}
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
                    <Pressable style={{ zIndex: 1, position: 'absolute' }} onPress={() => { setModalVisibleVideo(false); setUrlModalVideo('') }}>
                        <Text style={{ fontSize: 20 }}>X</Text>
                    </Pressable>
                    <Video
                        style={{ width: '100%', height: '100%', borderRadius: 5 }}
                        // Can be a URL or a local file.
                        source={{ uri: urlModalVideo }}
                        resizeMode="cover"
                        controls={true}
                        filterEnabled={true}
                    />
                </View>
            </Modal>
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisibleUser}
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
                    <FlatList
                        data={listUser?.filter((user: any) => user.userID != keyClient)}
                        renderItem={({ item }: any) => {
                            return (
                                <View>
                                    <BouncyCheckbox
                                        size={25}
                                        fillColor="#333030"
                                        text={item.name}
                                        iconStyle={{ borderColor: "#ffffff", borderRadius: 5 }}
                                        innerIconStyle={{ borderWidth: 1, borderRadius: 5 }}
                                        onPress={(isChecked: boolean) => { isChecked ? setListUserAdd((pre: any) => pre ? [...pre, item.userID] : [item.userID]) : setListUserAdd((pre: any) => pre && pre.filter((data: any) => data != item.userID)) }}
                                        textStyle={{
                                            textDecorationLine: "none",
                                        }}
                                        style={{ marginBottom: 5 }}
                                    />
                                </View>

                            )
                        }}
                    />
                    <Button title='AddUser' onPress={() => { setModalVisibleUser(!modalVisibleUser); AddUser() }} />

                </View>
            </Modal>
            <Text style={{ fontSize: 20, fontWeight: 'bold', textAlign: 'center' }}>{title}</Text>
            <Button title='AddUser' onPress={() => setModalVisibleUser(!modalVisibleUser)} />
            {
                messages?.map((item: any, index: number) => {
                    return (
                        (item.name == userName) ?
                            <View key={index} style={{ alignSelf: 'flex-end', marginRight: 10, marginBottom: 5 }}>
                                {item.text.includes('https://firebasestorage.googleapis.com') && (item.text.includes('.mp4')) ?

                                    <Pressable onPress={() => { setUrlModalVideo(item.text); setModalVisibleVideo(true) }}>
                                        <Video
                                            style={{ width: 120, height: 100, borderRadius: 5 }}
                                            // Can be a URL or a local file.
                                            source={{ uri: item.text }}
                                            resizeMode="cover"
                                            controls={true}
                                        />
                                    </Pressable>
                                    :
                                    (item.text.includes('https://firebasestorage.googleapis.com') && item.text.includes('.jpg')) ?
                                        <View>
                                            <Pressable onPress={() => { setModalVisible(true); setUrlModal(item.text) }}>
                                                <Image style={{ width: 120, height: 100, borderRadius: 5 }} source={{ uri: item.text }} />
                                            </Pressable>
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
                                    {item.text.includes('https://firebasestorage.googleapis.com') && (item.text.includes('.mp4')) ?
                                        <Pressable onPress={() => { setUrlModalVideo(item.text); setModalVisibleVideo(true) }}>
                                            <Video
                                                style={{ width: 120, height: 100, borderRadius: 5 }}
                                                // Can be a URL or a local file.
                                                source={{ uri: item.text }}
                                                resizeMode="cover"
                                                controls={true}
                                            />
                                        </Pressable>
                                        :
                                        (item.text.includes('https://firebasestorage.googleapis.com') && item.text.includes('.jpg')) ?
                                            <View>
                                                <Pressable onPress={() => { setModalVisible(true); setUrlModal(item.text) }}>
                                                    <Image style={{ width: 120, height: 100, borderRadius: 5 }} source={{ uri: item.text }} />
                                                </Pressable>
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
                        onChangeText={handleTyping}
                        onChange={(e) => setMessageText(e.nativeEvent.text)}
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

export default Chat

const styles = StyleSheet.create({})