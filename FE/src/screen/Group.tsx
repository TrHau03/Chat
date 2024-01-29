import { FlatList, Image, ListRenderItemInfo, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { UseConText } from '../provider/Context';
import { useIsFocused, useNavigation } from '@react-navigation/native';

const Group = () => {
    const navigation = useNavigation<any>();
    const { socket, keyClient, userGoogle }: any = useContext(UseConText);
    const isFocus = useIsFocused();
    const [listRoom, setListRoom] = useState<any>([]);
    const [nameRoom, setNameRoom] = useState<string>('');
    useEffect(() => {
        socket.emit('findAllRoom', { clientID: keyClient }, (e: any) => {
            setListRoom(e);
            socket.on('room', (e: any) => {
                if (e.userID.includes(keyClient)) {
                    setListRoom((prevRoom: any) => {
                        const check = prevRoom.find((room: any) => room.roomID == e.roomID);
                        if (check) {
                            return prevRoom;
                        }
                        return [...prevRoom, e]
                    });
                }
                !e.userID.includes(keyClient) && setListRoom((prevRoom: any) => prevRoom.filter((room: any) => room?.roomID != e?.roomID))
            });
        });

        return () => { }
    }, [])
    const handleCreateRoom = () => {
        nameRoom != '' && socket.emit('createRoom', { roomID: listRoom?.length + 1, nameRoom: nameRoom, userID: [keyClient] });
        setNameRoom('');
    }
    return (
        <View>
            <View style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '100%', height: 'auto', rowGap: 10, marginTop: 20 }}>
                <TextInput style={{ borderWidth: 0.5, borderRadius: 5, width: '80%', paddingVertical: 5 }} placeholder='NameRoom' value={nameRoom} onChangeText={setNameRoom} />
                <Pressable onPress={handleCreateRoom} style={{ width: '80%', height: 40, justifyContent: 'center', alignItems: 'center', backgroundColor: '#494949', borderRadius: 5 }}>
                    <Text style={{
                        color: '#fff', fontSize: 18, fontWeight: 'bold',
                    }}>CreateRoom</Text>
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
                            <Pressable onPress={() => navigation.navigate('Chat', { keyClient, roomID: item.roomID, userName: userGoogle.name, title: item.nameRoom })} style={{ width: '100%', backgroundColor: 'gray', paddingVertical: 5, justifyContent: 'center', alignItems: 'center', borderRadius: 5 }}>
                                <Text style={{
                                    color: 'white',
                                    fontSize: 20,
                                    fontWeight: '500',
                                }}>{item?.nameRoom}</Text>
                            </Pressable>
                        )
                    }} />
            </View>
        </View>
    )
}

export default Group

const styles = StyleSheet.create({})