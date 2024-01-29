import { Button, FlatList, Image, Modal, PermissionsAndroid, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client';
import { UseConText } from '../provider/Context';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import uuid from 'react-native-uuid';
import storage from '@react-native-firebase/storage';
import Video from 'react-native-video';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { NativeStackHeaderProps } from '@react-navigation/native-stack';
const Chat11 = (prop: any) => {
    const { keyClient, user, userName, title, avatar } = prop.route.params;
    const { navigation }: NativeStackHeaderProps = prop;
    const { socket, userGoogle }: any = useContext(UseConText);
    const [messages, setMessages] = useState<any>();
    const [messageText, setMessageText] = useState<string>();
    const [typingDisplay, setTypingDisplay] = useState<string>();
    const [roomInfo, setRoomInfo] = useState<any>();
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [modalVisibleVideo, setModalVisibleVideo] = useState<boolean>(false);
    const [focus, setFocus] = useState<boolean>(false);
    const [urlModal, setUrlModal] = useState<string>('');
    const [urlModalVideo, setUrlModalVideo] = useState<string>('');
    const [listActive, setListActive] = useState<any>();
    useEffect(() => {
        socket.emit('createRoomByUser', { roomID: uuid.v4(), userID: [keyClient, user], userName, keyClient }, (e: any) => {
            setRoomInfo(e);
            setMessages(e.messages);
            socket.on('typing', ({ name, isTyping, roomIDTyping }: any) => {
                if (isTyping) {
                    name != userName && roomIDTyping == e?.roomID && setTypingDisplay(`${name} is typing`);
                } else {
                    setTypingDisplay('');
                }
            });
            socket.on('messagesByUser', (newMessage: any) => {
                e?.roomID == newMessage?.roomID && setMessages((prevMessages: any) => [...prevMessages, newMessage?.messages]);
            });
        });
        socket.emit('getListActive', (e: any) => {
            console.log(e);
            setListActive(e);
        })
        socket?.on('listActive', (e: any) => {
            setListActive(e);
        })
    }, []);
    const flatListRef = useRef<any>(null);
    useEffect(() => {
        // Scroll to the bottom when the component mounts or when data changes
        flatListRef.current && flatListRef.current.scrollToEnd({ animated: true });
    }, [messages]);
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
            socket.emit('onCuntMessageUnSeen', { keyClient, userID: user, name: title })
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
            <View style={{ flexDirection: 'row', marginLeft: 10, justifyContent: 'flex-start', alignItems: 'center' }}>
                <Pressable onPress={() => navigation.goBack()}>
                    <MaterialIcons name='arrow-back' size={30} />
                </Pressable>
                <View style={{ flexDirection: 'row' }}>
                    <View style={{ height: 50, marginLeft: 10 }}>
                        <Image source={{ uri: avatar }} style={{ width: 50, height: 50, borderRadius: 50 }} />
                        <View style={{ width: 10, height: 10, borderRadius: 10, backgroundColor: listActive?.find((userActive: any) => userActive.clientID == user) ? 'green' : 'gray', position: 'absolute', bottom: 3, right: 3 }}></View>
                    </View>
                    <View >
                        <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{title}</Text>
                        <Text style={{ color: 'gray' }}>{listActive?.find((userActive: any) => userActive.clientID == user) ? 'Online' : 'Offline'}</Text>
                    </View>
                </View>
            </View>
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
                                <Image source={{ uri: avatar }} style={{ width: 30, height: 30, backgroundColor: '#b7b7b7', borderRadius: 50, marginLeft: 10, marginRight: 5 }} />
                                <View style={{ maxWidth: '80%' }}>
                                    <Text style={{ fontSize: 16 }}>{item.name}</Text>
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
                                            <Text style={{ fontSize: 20, borderRadius: 10, borderWidth: 0.5, paddingHorizontal: 5 }} >{item.text}</Text>
                                    }
                                </View>
                            </View>
                    )
                }}
                keyExtractor={(item: any, index: number) => index.toString()}
                style={{ maxHeight: focus ? '75%' : '82%', marginTop: 10}}
            />
            <View style={{ position: 'absolute', width: '100%', bottom: 20 }}>
                <Text style={{ fontSize: 20 }}>{typingDisplay}</Text>
                <View style={{ borderWidth: 0.5, width: '95%', flexDirection: 'row', borderRadius: 10, marginHorizontal: 5, alignSelf: 'center' }}>
                    <TextInput
                        style={{ backgroundColor: '#fafafa', width: '70%' }}
                        value={messageText}
                        onChange={(e) => setMessageText(e.nativeEvent.text)}
                        onChangeText={handleTyping}
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
                            sendMessage(messageText);
                        }}
                        style={{ borderWidth: 1, width: '15%', justifyContent: 'center', alignItems: 'center', borderTopRightRadius: 10, borderBottomRightRadius: 10 }}
                    >
                        <Text>Gửi</Text>
                    </Pressable>
                </View>
            </View>

        </View >
    )
}

export default Chat11

const styles = StyleSheet.create({})