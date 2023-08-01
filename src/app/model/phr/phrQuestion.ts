import {Question} from "./question"

export class PhrQuestion {
    public text: string;
    public taskId: number;
    public question: Question[] = new Array<Question>();
    public viewModeText: string;
}