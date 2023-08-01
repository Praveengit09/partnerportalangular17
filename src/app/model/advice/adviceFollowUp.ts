import { Question } from '../phr/question';
 export class AdviceFollowup {
    public  id:number;
    public  title:String;
    public  timestamp:number;
    public  status:number;
    // public  originalAdvice:PharmaAdvice;
    // public  modifiedAdvice:PharmaAdvice;
    public  times:AdviceFollowup[]=new Array();
    public  questions:Question;
    public  followupResponse:String;
    public  sessionType:number;
 }