import { Location } from './location';
import { Coordinates } from '../poc/coordinates';
export class Address {

	public static ADDRESS_HOME = 0;
	public static ADDRESS_OFFICE = Address.ADDRESS_HOME + 1;
	public static ADDRESS_OTHER = Address.ADDRESS_OFFICE + 1;
	public static ADDRESS_EMERGENCY = Address.ADDRESS_OTHER + 1;


	public addressId: number;
	public doorNo: string;
	public address1: string;
	public address2: string;
	public mapsLink: string = '';
	public landmark: string;
	public area: number;
	public city: number;
	public state: number;
	public region: number;
	public countryId: number;
	public referenceId: string;
	public cityName: any;
	public stateName: any;
	public location: Location;
	public locationCoordinates: Coordinates;
	public country: string;
	public regionName: string;
	public areaName: string;
	public pinCode: string;
	public addressType: number;
	public label: string;
}