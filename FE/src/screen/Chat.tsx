import { Button, FlatList, Image, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client';
import { UseConText } from '../provider/Context';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import uuid from 'react-native-uuid';
import storage from '@react-native-firebase/storage';
import BouncyCheckbox from "react-native-bouncy-checkbox";
import Video from 'react-native-video';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'

const Chat = (prop: any) => {
    const { keyClient, roomID, userName, title } = prop.route.params;

    const { socket }: any = useContext(UseConText);
    const [messages, setMessages] = useState<any>();
    const [messageText, setMessageText] = useState<string>();
    const [typingDisplay, setTypingDisplay] = useState<string>();
    const [listUser, setListUser] = useState<any>();
    const [listUserRoom, setListUserRoom] = useState<any>();
    const [modalVisibleUser, setModalVisibleUser] = useState<boolean>(false);
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [modalVisibleVideo, setModalVisibleVideo] = useState<boolean>(false);
    const [focus, setFocus] = useState<boolean>(false);
    const [urlModal, setUrlModal] = useState<string>('');
    const [urlModalVideo, setUrlModalVideo] = useState<string>('');

    useEffect(() => {
        socket.emit('findAllMessages', { roomID }, (e: any) => {
            const newMess: any = []
            e?.map((item: any) => {
                item.messages.map((message: any) => {
                    newMess?.push(message)
                });
                item.userID.map((user: any) => {
                    setListUserRoom((pre: any) => pre ? [...pre, user] : [user])
                })
            });
            setMessages(newMess);
        });
        socket.emit('findAllUser', (e: any) => {
            setListUser(e);
        });
    }, []);

    useEffect(() => {
        socket.on('messages', (newMessage: any) => {
            roomID == newMessage.roomID && setMessages((prevMessages: any) => [...prevMessages, newMessage.messages]);
        });
        socket.on('roomUpdate', (e: any) => {
            setListUserRoom(e.userID);
        })
        socket.on('typing', ({ name, isTyping, roomIDTyping }: any) => {
            if (isTyping) {
                name != userName && roomIDTyping == roomID && setTypingDisplay(`${name} is typing`);
            } else {
                setTypingDisplay('');
            }
        });
    }, []);
    const flatListRef = useRef<any>(null);
    useEffect(() => {
        // Scroll to the bottom when the component mounts or when data changes
        flatListRef.current && flatListRef.current.scrollToEnd({ animated: true });
    }, [messages]);
    const AddUser = async () => {
        socket.emit('updateUserRoom', { roomID, userID: listUserRoom });
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
                        style={{ paddingHorizontal: 20, paddingVertical: 10 }}
                        data={listUser?.filter((user: any) => user.id != keyClient)}
                        renderItem={({ item }: any) => {
                            return (
                                <View>
                                    <BouncyCheckbox
                                        isChecked={listUserRoom?.includes(item.id) ? true : false}
                                        size={25}
                                        fillColor="#333030"
                                        textComponent={<View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginLeft: 10, columnGap: 10 }}>
                                            <Image style={{ width: 50, height: 50, borderRadius: 50 }} source={{ uri: item.avatar }} />
                                            <Text style={{ color: 'black', fontSize: 22, fontWeight: '700' }}>{item.name}</Text>
                                        </View>}

                                        iconStyle={{ borderColor: "#ffffff", borderRadius: 5 }}
                                        innerIconStyle={{ borderWidth: 1, borderRadius: 5 }}
                                        onPress={(isChecked: boolean) => {
                                            console.log(isChecked);
                                            isChecked ? setListUserRoom((pre: any) => pre ? [...pre, item.id] : [item.id]) : setListUserRoom((pre: any) => pre && pre.filter((data: any) => data != item.id))
                                        }}
                                        textStyle={{
                                            textDecorationLine: "none",
                                        }}
                                        style={{ marginBottom: 5 }}
                                    />
                                </View>

                            )
                        }}
                    />
                    <Pressable onPress={() => { setModalVisibleUser(!modalVisibleUser); AddUser() }} style={{ position: 'absolute', bottom: 20, alignSelf: 'center', width: '80%', backgroundColor: 'gray', borderRadius: 20 }}>
                        <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold', textAlign: 'center', paddingVertical: 15 }}>Add User</Text>
                    </Pressable>
                </View>
            </Modal>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View></View>
                <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginLeft: 25 }}>{title}</Text>
                <Pressable onPress={() => setModalVisibleUser(!modalVisibleUser)}>
                    <MaterialIcons name="add" size={30} color="gray" />
                </Pressable>
            </View>
            {/* {
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
            } */}
            <FlatList
                ref={flatListRef}
                onContentSizeChange={() => {
                    // Scroll to the bottom when content size changes
                    flatListRef.current.scrollToEnd({ animated: true });
                }}
                onLayout={() => {
                    // Scroll to the bottom when layout changes
                    flatListRef.current.scrollToEnd({ animated: true });
                }}
                data={messages ? messages : null}
                renderItem={({ item }: any) => {
                    return (
                        (item.clientID == keyClient) ?
                            <View style={{ alignSelf: 'flex-end', marginRight: 10, marginBottom: 5 }}>
                                {item.text.includes('https://firebasestorage.googleapis.com') && (item.text.includes('.mp4')) ?

                                    <Pressable onPress={() => { setUrlModalVideo(item.text); setModalVisibleVideo(true) }}>
                                        <Video
                                            style={{ width: 200, height: 150, borderRadius: 5 }}
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
                                                <Image style={{ width: 200, height: 150, borderRadius: 5 }} source={{ uri: item.text }} />
                                            </Pressable>
                                        </View>
                                        :
                                        <Text style={{ fontSize: 20, maxWidth: '80%', borderRadius: 10, borderWidth: 0.5, paddingHorizontal: 5 }} >{item.text}</Text>
                                }
                            </View>
                            :
                            <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', marginBottom: 5 }}>
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
                }}
                keyExtractor={(item: any, index: number) => index.toString()}
                style={{ maxHeight: focus ? '76%' : '82%', marginTop: 10 }}
            />
            <View style={{ position: 'absolute', width: '100%', bottom: 20 }}>
                <Text style={{ fontSize: 20 }}>{typingDisplay}</Text>
                <View style={{ borderWidth: 0.5, width: '95%', flexDirection: 'row', borderRadius: 10, marginHorizontal: 5, alignSelf: 'center' }}>
                    <TextInput
                        style={{ backgroundColor: '#fafafa', width: '70%' }}
                        value={messageText}
                        onChangeText={handleTyping}
                        onChange={(e) => setMessageText(e.nativeEvent.text)}
                        onFocus={() => setFocus(true)}
                        onBlur={() => setFocus(false)}
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
                            messageText != '' && sendMessage(messageText);
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