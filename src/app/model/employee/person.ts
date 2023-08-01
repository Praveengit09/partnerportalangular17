import { RoleBasedAddress } from './roleBasedAddress';
import { Address } from '../poc/address';

export class Person {
    public static serialVersionUID: number = -2271664863259065254;
    public empId: number;
    public title: string;
    public firstName: string;
    public lastName: string;
    public gender: string;
    public contactList: Array<string> = new Array<string>();
    public emailId: string;
    public addressList: Array<Address>;
    public imageUrl: string;
    public profileImageData: string;
    public signatureImageData: string;
    public signatureImageUrl: string;
    public certificateImageUrl: Array<any>;;
    public description: string;
    public createdTimestamp: number;
    public updatedTime: number;
    //local use
    public id: number;
    public itemName: string;
    public tempContactList: string[];
}