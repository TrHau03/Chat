import React, { createContext } from "react";
import { io } from "socket.io-client";
export const UseConText = createContext({});

export const AppProvider = ({ children }: any) => {
    const socket = io('http://192.168.1.12:3000');
    return (
        <UseConText.Provider value={{socket}}>
            {children}
        </UseConText.Provider>
    )

}