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
  async findAllRoom() {
    const room = this.messagesService.findAllRoom();
    return room;
  }
  @SubscribeMessage('findAllUser')
  async findAllUser() {
    const user = this.messagesService.findAllUser();
    return user;
  }
  @SubscribeMessage('createRoom')
  async createRoom(@MessageBody() createRoomDto: { id: string, messages: Message }) {
    const room = await this.messagesService.createRoom(createRoomDto);
    this.server.emit('room', room);
    return;
  }
  @SubscribeMessage('createRoomByUser')
  async createRoomByUser(@MessageBody() createRoomDto: { id: string, messages: Message }) {
    const roomByUser = await this.messagesService.createRoomByUser(createRoomDto);
    this.server.emit('roomByUser', roomByUser);
    return;
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
    this.server.emit('messagesByUser', messagesByUser);
    return;
  }
  @SubscribeMessage('findAllMessages')
  async findAll(@MessageBody('roomID') roomID: string) {
    const messages = this.messagesService.findAllMessByRoomID(roomID);
    return messages;
  }
  @SubscribeMessage('findAllMessagesByUser')
  async findAllByUser(@MessageBody('roomID') roomID: string) {
    const messagesByUser = this.messagesService.findAllMessByRoomIDByUser(roomID);
    return messagesByUser;
  }
  @SubscribeMessage('join')
  async join(@MessageBody('name') name: string, @ConnectedSocket() client: Socket) {
    const clientObject = await this.messagesService.identify(name, client.id);
    return clientObject;
  }
  @SubscribeMessage('typing')
  async typing(@MessageBody('isTyping') isTyping: boolean, @MessageBody('keyClient') keyClient: string, @MessageBody('roomIDTyping') roomIDTyping: string) {
    const name = await this.messagesService.getClientName(keyClient);
    this.server.emit('typing', { name, isTyping, roomIDTyping });
  }
}
