import { Instance } from "./instance";

export class ChatService{

    public doctorId : number;
	public serviceId : number;
	public userPackageId : number;
	public chatCount : number;
	public chatCompleted : number;
	public instances : Array<Instance>;
	public chatFrequencyDaysLimit : number;
}