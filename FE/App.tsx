/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useContext, useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import Chat from './src/screen/Chat';
import { AppProvider, UseConText } from './src/provider/Context';
import Chat11 from './src/screen/Chat11';
import Login from './src/screen/Login';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import Home from './src/screen/Home';
import Messages from './src/screen/Message';
import Profile from './src/screen/Profile';



const Stack = createNativeStackNavigator();


const Message = () => {
  return (
    <Stack.Navigator initialRouteName='Room'>
      <Stack.Screen name="Room" component={Home} options={{ headerShown: false }} />
      <Stack.Screen name="Chat" component={Chat} options={{ headerShown: false }} />
      <Stack.Screen name="Chat11" component={Chat11} options={{ headerShown: false }} />
    </Stack.Navigator>
  )
}
function BottomTab() {
  const Tab = createMaterialBottomTabNavigator();
  return (
    <Tab.Navigator initialRouteName='Message'>
      <Tab.Screen name="Message" component={Message} options={{
        tabBarLabel: 'Message',
        tabBarIcon: ({ focused }) => (
          <MaterialCommunityIcons name="facebook-messenger" color={focused ? 'green' : 'gray'} size={26} />
        ),
      }} />
      <Tab.Screen name="Settings" component={Profile} options={{
        tabBarLabel: 'Settings',
        tabBarIcon: ({ focused }) => (
          <MaterialIcons name="settings" color={focused ? 'green' : 'gray'} size={26} />
        ),
      }} />
    </Tab.Navigator>
  )
}

function App(): React.JSX.Element {
  return (
    <AppProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name='App' component={BottomTab} />
        </Stack.Navigator>
      </NavigationContainer>
    </AppProvider>
  );
}

export default App;
