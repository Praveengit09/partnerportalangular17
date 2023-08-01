import { ChatMessage } from './chatmessage';

export class ChatUserRecord {
    public static PATIENT_TYPE = 1;
    public static EMP_TYPE = 2;

    public empId: number;
    public parentProfileId: number;

    public userType: number;

    public roomId: string;

    public firstName: string;
    public lastName: string;
    public dob: number;
    public imageUrl: string;
    public age: number;
    public gender: string;

    public lastConversationTime: number;
    public noOfUnreadConversations: number;

    public conversations: Array<ChatMessage> = new Array<ChatMessage>();

    public doctorList: Array<ChatUserRecord>;
    public patientList: Array<ChatUserRecord>;

    public updatedTimestamp: number;
    public packageId: number;
    public userPackageId: number;
    //local Use
    public onlineStatus: number = 0;
}