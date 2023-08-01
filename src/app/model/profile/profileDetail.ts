import { ContactInfo } from './contactInfo';

export class ProfileDetail{
    public updatedTime:number;
    public age: number;
	public contactInfo: ContactInfo = new ContactInfo();
	public dob: number;
	public fName: string;
	public gender: string;
	public relationShip: number;
	public profileId: number;
	public lName: string;	
	public createdTime: number;
    public providedOnlyAge: boolean;
    public onboardingStatus:number;
    public phrCompleteness:number;
    public caloriesConsumed:number;
    public totalCalories:number;
    public caloriesBurned:number;
}