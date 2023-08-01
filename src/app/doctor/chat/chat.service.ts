import { ChatMessage } from './../../model/chat/chatmessage';
import { ChatUserRecord } from './../../model/chat/chatUserRecord';
import { AppConstants } from './../../base/appconstants';
import { AuthService } from './../../auth/auth.service';
import { HttpService } from './../../base/http.service';
import { Injectable } from "@angular/core";
import { Observable } from 'rxjs';
// import * as io from 'socket.io-client';
import { io } from 'socket.io-client';
import { Config } from './../../base/config';
import { CryptoUtil } from '../../auth/util/cryptoutil';

@Injectable()
export class ChatService {
    private socket;
    toContact: ChatUserRecord;
    contactList: Array<ChatUserRecord>;
    countFromMessage: number;

    constructor(private httpService: HttpService,
        private auth: AuthService) {
        console.log(Config.URLS.CHAT_SERVER_URL)
        this.connect();
    }

    connect() {
        this.socket = io(Config.URLS.CHAT_SERVER_URL + 'chat');
        this.socket.auth = { sessionid: this.getSessionId() };
        // this.socket.onAny((event, ...args) => {
        //     console.log(event, args);
        // });
    }

    private getSessionId(): string {
        let sessionId: string = null;
        let cryptoUtil: CryptoUtil = new CryptoUtil();
        if (window.localStorage.getItem('raptor') != null && window.localStorage.getItem('raptor').length > 0) {
            sessionId = cryptoUtil.decryptData(window.localStorage.getItem('raptor'));
        }
        return sessionId;
    }

    onReconnect() {
        return new Observable((observer) => {
            this.socket.on('reconnect', (event) => {
                console.log('you have been reconnected', event);
                this.addUserToChat();
                observer.next('reconnect');
            });
        });
    }

    addUserToChat(profileId = this.auth.employeeDetails.empId) {
        if (!(this.socket && this.socket.connected)) {
            this.connect();
        }
        this.socket.emit('ONLINE', profileId, ChatUserRecord.EMP_TYPE)
    }

    userTyping(roomId) {
        if (!(this.socket && this.socket.connected)) {
            this.connect();
        }
        this.socket.emit('TYPING', roomId);
    }

    sendMessage(messageContent) {
        if (!(this.socket && this.socket.connected)) {
            this.connect();
        }
        this.socket.emit('SEND_MESSAGE', JSON.stringify(this.getChatContent(this.auth.userAuth, this.toContact, messageContent)));
        console.log(JSON.stringify('messagechat' + this.getChatContent(this.auth.userAuth, this.toContact, messageContent)));//remove

        this.sortContacts();
    }

    sendMessageImage(imageDetails) {
        if (!(this.socket && this.socket.connected)) {
            this.connect();
        }
        this.socket.emit('SEND_MESSAGE', JSON.stringify(this.getChatImgContent(this.auth.userAuth, this.toContact, imageDetails)));
        this.sortContacts();
    }

    loadChats() {
        if (!(this.socket && this.socket.connected)) {
            this.connect();
        }
        let reciverid = this.toContact.userType == ChatUserRecord.PATIENT_TYPE ? this.toContact.parentProfileId : this.toContact.empId

        this.socket.emit('GET_HISTORY_MESSAGES', this.auth.userAuth.employeeId, reciverid, this.countFromMessage, 50)
        console.log(this.auth.userAuth.employeeId, reciverid, this.countFromMessage);
    }

    sortContacts() {
        try {
            for (let i = 0; i < this.contactList.length; i++) {
                this.contactList[i].conversations.sort((a, b) => {
                    if (!a) return -1;
                    if (!b) return 1;
                    return +a.sentTimestamp - +b.sentTimestamp;
                });
                this.contactList[i].lastConversationTime = this.contactList[i].conversations[this.contactList[i].conversations.length - 1].sentTimestamp;
            }
            this.contactList.sort((a, b) => {
                if (!a) return 1;
                if (!b) return -1;
                return +b.lastConversationTime - +a.lastConversationTime;
            });
        } catch (error) {

        }
    }

    getChatContent(fromUser, toUser: ChatUserRecord, message = ''): ChatMessage {
        let chatContent: ChatMessage = new ChatMessage();
        chatContent.roomId = toUser.roomId ? toUser.roomId : this.generateRoomId(toUser);
        chatContent.senderId = fromUser.employeeId;
        chatContent.senderType = ChatUserRecord.EMP_TYPE;
        chatContent.senderName = fromUser.employeeName;
        chatContent.receiverId = (toUser.userType == ChatUserRecord.PATIENT_TYPE ? toUser.parentProfileId : toUser.empId);
        chatContent.receiverType = toUser.userType;
        chatContent.receiverName = toUser.firstName + ((toUser.lastName) ? ' ' + toUser.lastName : '');
        chatContent.message = message;
        chatContent.messageType = ChatMessage.MESSAGE_TYPE_TEXT;
        return chatContent;
    }

    getChatImgContent(fromUser, toUser: ChatUserRecord, imageDetails): ChatMessage {
        let imageContent: ChatMessage = new ChatMessage();
        imageContent.roomId = toUser.roomId ? toUser.roomId : this.generateRoomId(toUser);
        imageContent.senderId = fromUser.employeeId;
        imageContent.senderType = ChatUserRecord.EMP_TYPE;
        imageContent.senderName = fromUser.employeeName;
        imageContent.receiverId = (toUser.userType == ChatUserRecord.PATIENT_TYPE ? toUser.parentProfileId : toUser.empId);
        imageContent.receiverType = toUser.userType;
        imageContent.receiverName = toUser.firstName + ((toUser.lastName) ? ' ' + toUser.lastName : '');
        imageContent.documentInfo = imageDetails;
        imageContent.message = 'Image';
        imageContent.messageType = ChatMessage.MESSAGE_TYPE_ATTACHMENT;

        return imageContent;
    }


    getMessages() {
        return Observable.create((observer) => {
            this.socket.on('SEND_MESSAGE', (data) => {
                if (data) {
                    let message = JSON.parse(data);
                    console.log(data);

                    message.isSelf = 1;
                    observer.next(message);
                    this.socket.emit('READ_MESSAGE', message.senderId, message.receiverId);
                }
            });
        });
    }

    getPreviousChats() {
        console.log('service on get  ');
        return Observable.create((observer) => {
            this.socket.on('GET_HISTORY_MESSAGES', (data) => {
                if (data) {

                    let previousMessage = JSON.parse(data);
                    previousMessage.isSelf = 1;
                    observer.next(previousMessage);
                    console.log(previousMessage);
                }
            });
        });
    }

    getAllContactConversation() {
        return Observable.create((observer) => {
            this.socket.on('SEND_CONTACTS', (contacts, callBack) => {
                contacts = JSON.parse(contacts);
                console.log(contacts)
                observer.next(contacts);
                if (callBack) callBack();
            });
        });
    }

    isUsertyping(roomId) {
        return Observable.create((observer) => {
            this.socket.on('TYPING', () => {
                observer.next({ status: 1 });
            });
        });
    }

    listenForContactOnlineStatus() {

        if (this.contactList && this.contactList.length > 0) {
            this.contactList.forEach((contact) => {
                this.socket.on('ONLINE', (res) => {
                    let onlineStatus = JSON.parse(res);
                    if (contact.empId === onlineStatus.senderId) {
                        contact.onlineStatus = +onlineStatus.status;
                        console.log((contact.empId));

                    }
                    console.log(JSON.stringify(onlineStatus) + 'com  ');
                })
            })
        }
    }




    disconnetSocket(profileId = this.auth.employeeDetails.empId) {
        this.toContact = undefined;
        this.contactList = [];
        this.socket.emit('DISCONNECT', profileId, ChatUserRecord.EMP_TYPE);
    }

    getDoctorContactList(doctorId: number): Promise<any> {
        return this.httpService.httpGetPromise(this.httpService.getPaths().GET_DOCTOR_CONTACTLIST + "?doctorId=" + doctorId, AppConstants.POZ_BASE_URL_INDEX)
            .then((data) => {
                console.log(data);
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }

    searchForDoctors(body: any): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().GET_REFERRAL_DOCTOR_SEARCH,
            JSON.stringify(body), AppConstants.ELASTIC_URL_INDEX).then((data) => {
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }

    addDocToContactList(body: any): Promise<any> {
        return this.httpService.httpPostPromise(this.httpService.getPaths().ADD_DOCTOR_TO_CONTACTLIST,
            JSON.stringify(body), AppConstants.POZ_BASE_URL_INDEX).then((data) => {
                console.log(data);
                return Promise.resolve(data);
            }).catch((err) => {
                // if (err) {
                console.log(err);
                return Promise.reject(err);
                // }
            });
    }

    generateRoomId(contact) {
        let roomId = '';
        if (contact.userType == ChatUserRecord.EMP_TYPE) {
            if (+contact.empId > +this.auth.employeeDetails.empId) {
                roomId = 'E' + this.auth.employeeDetails.empId + '_' + 'E' + contact.empId;
            } else {
                roomId = 'E' + contact.empId + '_' + 'E' + this.auth.employeeDetails.empId;
            }
        } else {
            roomId = 'P' + contact.parentProfileId + '_' + 'E' + this.auth.employeeDetails.empId;
        }
        return roomId;
    }

}