import { Injectable } from '@nestjs/common';
import { Message } from './entities/message.entity';

@Injectable()
export class MessagesService {
  clientToUser: { id: string, avatar: string, name: string }[] = [];
  room: {
    roomID: string;
    userID: any;
    nameRoom: string;
    messages: Message[]
  }[] = [];
  roomByUser: {
    roomID: string;
    userID: any;
    messages: Message[]
  }[] = [];
  active: { clientID: string; avatar: string, name: string, status: string }[] = [];
  createRoom(createRoomDto: any) {
    const room = {
      roomID: createRoomDto.roomID,
      nameRoom: createRoomDto.nameRoom,
      userID: createRoomDto.userID,
      messages: []
    };
    this.room.push(room);
    return room;
  }
  updateUserRoom(updateRoomDto: any) {
    const room = this.room.find((room: any) => room.roomID == updateRoomDto.roomID);
    console.log(updateRoomDto.userID);
    room.userID = updateRoomDto.userID;
    return room;
  }
  createRoomByUser(createRoomDto: any) {
    const findRoom = this.roomByUser.find((room: any) => room.userID.every((userID: any) => createRoomDto.userID.includes(userID)));
    if (findRoom) {
      findRoom.messages.map((mess: Message) => createRoomDto.keyClient != mess.clientID ? mess.isSeen = true : mess.isSeen);
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
    const user = this.clientToUser.find((user: any) => user.id == createMessageDto.clientID)
    const messages = {
      clientID: createMessageDto.clientID,
      name: user.name,
      text: createMessageDto.text
    };
    this.room.map((room: any) => {
      room.roomID == createMessageDto.roomID && room.messages.push(messages);
    });
    return { messages, roomID: createMessageDto.roomID };
  }
  createMessagesByUser(createMessageDto: any) {
    const user = this.clientToUser.find((user: any) => user.id == createMessageDto.clientID)
    const messages = {
      clientID: createMessageDto.clientID,
      name: user.name,
      isSeen: false,
      text: createMessageDto.text
    };
    this.roomByUser.map((room: any) => {
      room.roomID == createMessageDto.roomID && room.messages.push(messages);
    });
    return { messages, roomID: createMessageDto.roomID };
  }
  countMessageUnSeen(keyClient: string, userID: string, name: string) {
    const room = this.roomByUser.find((room: any) => room.userID.includes(userID) && room.userID.includes(keyClient));
    console.log(room);
    const count = room ? room.messages.filter((mess: Message) => mess.isSeen == false && mess.name != name).length : 0;
    console.log(count);
    return count;
  }
  identify(name: string, clientID: string, avatar: string) {
    const user = this.clientToUser.find((user: any) => user.id == clientID)
    if (!user) {
      this.clientToUser.push({ id: clientID, avatar: avatar, name: name });
      return clientID;
    }
    return user.id;
  }
  getClientName(clientID: string) {
    const user = this.clientToUser.find((user: any) => user.id == clientID)
    return user.name;
  }
  findAllMessByRoomID(roomID: string) {
    console.log(this.room);
    return this.room.filter((room: any) => {
      return room.roomID == roomID;
    });
  }
  findAllRoom(clientID: string) {
    const room = this.room.filter((room: any) => room.userID.includes(clientID));
    return room;
  }
  findAllUser() {
    return this.clientToUser;
  }
  updateStatus(keyClient: string, active: boolean, avatar: string, name: string, status: string) {
    if (active) {
      const check = this.active.findIndex((val: { clientID: string }) => val.clientID == keyClient);
      if (check != -1 && status != undefined) {
        this.active[check].status = status;
      } else if (check == -1) {
        this.active.push({ clientID: keyClient, avatar, name, status: '' })
      };
    } else {
      const index = this.active.findIndex((key: { clientID: string }) => key.clientID == keyClient);
      this.active.splice(index, 1);
    }
    console.log(this.active);
    return this.active
  }
  getListActive() {
    return this.active;
  }
}
