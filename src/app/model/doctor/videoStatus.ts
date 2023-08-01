import { SessionBean } from './../slotbooking/sesssionBean';
export class VideoStatus{
    public static USER_TYPE_DOCTOR = 0 ;
    public static USER_TYPE_PATIENT = 1 ;

    code:number;
    msg:string;

    token: string;
    apiKey: string;
    sessionId: string;
    userType: number;

    network:string;

    sessionBean:SessionBean;
}