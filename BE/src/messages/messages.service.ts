import { Injectable } from '@nestjs/common';
import { Message } from './entities/message.entity';

@Injectable()
export class MessagesService {
  clientToUser = {};
  room: {
    roomID: string;
    nameRoom: string;
    messages: Message[]
  }[] = [];
  roomByUser: {
    roomID: string;
    userID: any;
    messages: Message[]
  }[] = [];
  createRoom(createRoomDto: any) {
    const room = {
      roomID: createRoomDto.roomID,
      nameRoom: createRoomDto.nameRoom,
      messages: []
    };
    this.room.push(room);
    return room;
  }
  createRoomByUser(createRoomDto: any) {
    const findRoom = this.roomByUser.find((room: any) => room.userID.every((userID: any) => createRoomDto.userID.includes(userID)));
    if (findRoom) {
      return findRoom;
    } else {
      const room = {
        roomID: createRoomDto.roomID,
        userID: createRoomDto.userID,
        messages: []
      };
      this.roomByUser.push(room);
      return room;
    }
  }
  create(createMessageDto: any) {
    const messages = {
      name: this.clientToUser[createMessageDto.clientID],
      text: createMessageDto.text
    };
    this.room.map((room: any) => {
      room.roomID == createMessageDto.roomID && room.messages.push(messages);
    });
    return messages;
  }
  createMessagesByUser(createMessageDto: any) {
    
    const messages = {
      name: this.clientToUser[createMessageDto.clientID],
      text: createMessageDto.text
    };
    this.roomByUser.map((room: any) => {
      room.roomID == createMessageDto.roomID && room.messages.push(messages);
    });
    return messages;
  }
  identify(name: string, clientID: string) {
    const user = Object.values(this.clientToUser).find(user => user === name);
    if (!user) {
      this.clientToUser[clientID] = name;
    }
    return Object.keys(this.clientToUser).find(key => this.clientToUser[key] === name);;
  }
  getClientName(clientID: string) {
    return this.clientToUser[clientID];
  }
  findAllMessByRoomID(roomID: string) {
    console.log(this.room);
    return this.room.filter((room: any) => {
      return room.roomID == roomID;
    });
  }
  findAllMessByRoomIDByUser(roomID: string) {
    return this.roomByUser.filter((room: any) => {
      return room.roomID == roomID;
    });
  }
  findAllRoom() {
    return this.room;
  }
  findAllUser() {
    return this.clientToUser;
  }
}
