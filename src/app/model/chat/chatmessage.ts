import { DocumentInfo } from "./documentinfo";

export class ChatMessage {

    public static MESSAGE_NOT_DELIVERED = 0;
    public static MESSAGE_DELIVERED = 1;
    public static MESSAGE_READ = 2;

    public static MESSAGE_TYPE_TEXT = 0;
    public static MESSAGE_TYPE_ATTACHMENT = 1;

    public messageDeliveryStatus: number;
    public roomId: string;

    public senderId: number;
    public senderType: number;
    public senderName: string;

    public receiverId: number;
    public receiverType: number;
    public receiverName: string;

    public messageType: number;
    public message: string;

    public sentTimestamp: number;
    public receivedTimestamp: number;
    public readTimestamp: number;

    public isSelf: number;
    public documentInfo :DocumentInfo; 

}