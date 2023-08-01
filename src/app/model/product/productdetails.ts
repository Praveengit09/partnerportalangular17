import { Address } from '../poc/address';
import { DisplayDescription } from './displaydescription';
import { Product } from './product';

export class ProductDetails extends Product {
    public override productCode: string;

    public groupId : number;
	public groupName: string;
	
	public subGroupId: number;
	public subGroupName: string;
    
    public override schedule: string;

    public override brandName: string;
    public override manufacturerName: string;
    public override manufacturerAddress: Address;

    public override detailedDescriptionList: Array<DisplayDescription>;
    public override otherInformationList: Array<DisplayDescription>;
    public override imageURLs: Array<string>;

    public override warrantyDetails: Array<DisplayDescription>;
    public override disclaimers: Array<DisplayDescription>;

    public override pocId: number;

}