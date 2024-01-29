import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { UseConText } from '../provider/Context';
import { NativeStackHeaderProps } from '@react-navigation/native-stack';



const Messages = () => {
  const navigation = useNavigation<any>();
  const [listUser, setListUser] = useState<any>([]);
  const { socket, keyClient, userGoogle }: any = useContext(UseConText);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  useEffect(() => {
    socket.emit('findAllUser', (e: any) => {
      setListUser(e);
    });
    socket.on('updateCount', (e: any) => {
      setListUser((prev: any) => prev?.map((user: any) => {
        if (user.id == e.keyClient) {
          user.count = e.count
        } else {
          user.count = 0;
        }
        return user;
      }))

    })
  }, []);
  const RenderItem = ({ item }: any) => {
    const [count, setCount] = useState<number>(0);
    socket.emit('countMessageUnSeen', { keyClient, userID: item.id, name: userGoogle.name }, (e: any) => {
      setCount(e);
    });
    return (
      <Pressable onPress={() => { navigation.navigate('Chat11', { keyClient, user: item.id, userName: userGoogle.name, title: item.name, avatar: item.avatar }); setCount(0) }} style={{ width: '100%', flexDirection: 'row', paddingVertical: 5, justifyContent: 'center', alignItems: 'center', borderRadius: 5, gap: 10 }}>
        <Image style={{ width: 50, height: 50, borderRadius: 50 }} source={{ uri: item.avatar }} />
        <Text style={{
          color: '#000E08',
          fontSize: 20,
          fontWeight: '500',
        }}>{item.name}</Text>
        {count > 0 ? <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: 'red', justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontWeight: '500', color: 'white' }}>{count}</Text>
        </View> : <></>}
      </Pressable>
    )
  }
  return (
    <View>
      <View style={{ justifyContent: 'center', alignItems: 'center', width: '100%' }}>
        <FlatList
          style={{ width: '80%' }}
          onRefresh={() => {
            setRefreshing(true)
            socket.emit('findAllUser', (e: any) => {
              setListUser(e);
            });
            const rf = setTimeout(() => {
              setRefreshing(false)
              return () => clearTimeout(rf);
            }, 2000
            );
          }}
          refreshing={refreshing}
          contentContainerStyle={{ justifyContent: 'center' }}
          data={listUser?.filter((user: any) => user?.id != userGoogle.id)}
          renderItem={({ item }: any) =>
            <RenderItem item={item} />
          }
        />
      </View>
    </View>
  )
}

export default Messages
