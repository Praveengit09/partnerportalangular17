import { Coordinates } from "./coordinates";
export class Address {
	public addressId: number;
	public address1: string;
	public address2: string;
	public city: number;
	public state: number;
	public pinCode: string;
	public cityName: string;//not getting for wellness in poz from conquest
	public stateName: string;
	public location:any;//HashMap 
	public areaName : string;
	public locationCoordinates: Coordinates = new Coordinates();//Location  //not getting for wellness in poz from conquest
	public country: string;//new field added for getting data for wellness in poz from conquest
	public addressType: number;
	public label: string;
	public area: number;
	public region: number;
	public countryId: number;
	public regionName: string;
	
}