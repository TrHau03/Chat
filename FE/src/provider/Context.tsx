import React, { createContext, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import { io } from "socket.io-client";
export const UseConText = createContext({});

export const AppProvider = ({ children }: any) => {
    const socket = io('http://192.168.1.12:3000');
    const [keyClient, setKeyClient] = useState<string>();
    const [userName, setUserName] = useState<string | null>('');
    const [userGoogle, setUserGoogle] = useState<{ email: string, name: string, photo: string } | any>();
    
    return (
        <UseConText.Provider value={{ socket, keyClient, setKeyClient, userName, setUserName, userGoogle, setUserGoogle }}>
            {children}
        </UseConText.Provider>
    )

}