import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, ConnectedSocket } from '@nestjs/websockets';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { Server, Socket } from 'socket.io';
import { Message } from './entities/message.entity';

@WebSocketGateway({
  cors: {
    origin: '*'
  }
})
export class MessagesGateway {
  @WebSocketServer()
  server: Server;
  constructor(private readonly messagesService: MessagesService) { }


  @SubscribeMessage('findAllRoom')
  async findAllRoom(@MessageBody('clientID') clientID: string) {
    const room = this.messagesService.findAllRoom(clientID);
    return room;
  }
  @SubscribeMessage('findAllUser')
  async findAllUser() {
    const user = await this.messagesService.findAllUser();
    return user;
  }
  @SubscribeMessage('createRoom')
  async createRoom(@MessageBody() createRoomDto: { id: string, messages: Message }) {
    const room = await this.messagesService.createRoom(createRoomDto);
    this.server.emit('room', room);
    return;
  }
  @SubscribeMessage('updateUserRoom')
  async updateUserRoom(@MessageBody() updateRoomDto: any) {
    const room = await this.messagesService.updateUserRoom(updateRoomDto);
    this.server.emit('room', room);
    return;
  }
  @SubscribeMessage('createRoomByUser')
  async createRoomByUser(@MessageBody() createRoomDto: any) {
    const roomByUser = await this.messagesService.createRoomByUser(createRoomDto);
    return roomByUser;
  }
  @SubscribeMessage('createMessage')
  async create(@MessageBody() createMessageDto: CreateMessageDto) {
    const messages = await this.messagesService.create(createMessageDto);
    this.server.emit('messages', messages);
    return;
  }
  @SubscribeMessage('createMessageByUser')
  async createByUser(@MessageBody() createMessageDto: CreateMessageDto) {
    const messagesByUser = await this.messagesService.createMessagesByUser(createMessageDto);
    console.log(messagesByUser);
    this.server.emit('messagesByUser', messagesByUser);
    return;
  }
  @SubscribeMessage('countMessageUnSeen')
  async countMessageUnSeen(@MessageBody('keyClient') keyClient: string, @MessageBody('userID') userID: string, @MessageBody('name') name: string) {
    const count = this.messagesService.countMessageUnSeen(keyClient, userID, name);
    // this.server.emit('updateCount', {count, keyClient});
    return count;
  }
  @SubscribeMessage('onCuntMessageUnSeen')
  async onCountMessageUnSeen(@MessageBody('keyClient') keyClient: string, @MessageBody('userID') userID: string, @MessageBody('name') name: string) {
    const count = this.messagesService.countMessageUnSeen(keyClient, userID, name);
    this.server.emit('updateCount', { count, keyClient });
    return;
  }
  @SubscribeMessage('findAllMessages')
  async findAll(@MessageBody('roomID') roomID: string) {
    const messages = this.messagesService.findAllMessByRoomID(roomID);
    return messages;
  }
  @SubscribeMessage('join')
  async join(@MessageBody('name') name: string, @MessageBody('clientID') clientID: string, @MessageBody('avatar') avatar: string) {
    const clientObject = await this.messagesService.identify(name, clientID, avatar);
    return clientObject;
  }
  @SubscribeMessage('typing')
  async typing(@MessageBody('isTyping') isTyping: boolean, @MessageBody('keyClient') keyClient: string, @MessageBody('roomIDTyping') roomIDTyping: string) {
    const name = await this.messagesService.getClientName(keyClient);
    this.server.emit('typing', { name, isTyping, roomIDTyping });
  }
  @SubscribeMessage('status')
  async status(@MessageBody('keyClient') keyClient: string, @MessageBody('active') active: boolean, @MessageBody('avatar') avatar: string, @MessageBody('name') name: string, @MessageBody('status') status: string) {
    const listActive = await this.messagesService.updateStatus(keyClient, active, avatar, name, status);
    this.server.emit('listActive', listActive);
  }
  @SubscribeMessage('getListActive')
  async getListActive() {
    const listActive = await this.messagesService.getListActive();
    return listActive;
  }
}
