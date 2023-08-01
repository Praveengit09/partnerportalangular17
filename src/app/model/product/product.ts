import { PackingInformation } from './packinginformation';
import { BaseItem } from './baseItem';
import { StockDetails } from './stockdetails';
import { Address } from '../poc/address';
import { DisplayDescription } from './displaydescription';
import { Taxes } from '../basket/taxes';
export interface attributesMap {

}

export class Product extends BaseItem {
    public productStockList: Array<Product>;
    public categoryId: number;
    public categoryName: string;

    public referenceId: string;

    public drugFormId: number;
    public drugForm: string;
    public productId: number;
    public productName: string;
    public productDescription: string;
    public attributesMap: object;
    //  Map<string,object>
    public packageSoldLoose: boolean = false;

    public stockDetails: StockDetails = new StockDetails();
    public packingInformation: PackingInformation;

    public outOfStockName: string;

    public rxDrug: boolean = false;

    public stockList: any;
    /**local use */
    public isErrorFound: boolean;
    public isErrorMsg = new Array<string>();
    public isSelected: boolean = false;
    //public  parentCategory:ProductParentCategory;

    public productCode: string;


    public pocId: number;
    public brandName: string;
    public manufacturerName: string;
    public manufacturerAddress: Address;
    public schedule: string;
    public detailedDescriptionList: Array<DisplayDescription>;
    public otherInformationList: Array<DisplayDescription>;
    //public packingInformation:PackingInformation;
    public warrantyDetails: Array<DisplayDescription>;
    public disclaimers: Array<DisplayDescription>;
    public unitNetPrice: number;
    public rating: number;
    public adviceId: number;

    public prescriptionStatus: number;
    public proofDocumentUrlList: Array<String>;


    public totalRevenue: number;

    public imageURLs: Array<String>;

    public override looseQuantity: number;
    public flag: boolean;



    public purchaseEnabled: boolean;

    public override grossPrice: number;

    public override discountPrice: number;
    public override taxes: Taxes;

    public override netPrice: number;


    public override quantity: number;


    public override originalAmount: number;

    public override packageDiscountAmount: number;

    public couponDiscountAmount: number;

    public override otherDiscountAmount: number;

    public packageCashBackDiscountAmount: number;

    public couponCashBackDiscountAmount: number;

    public override taxationAmount: number;
    public override totalTaxes: Taxes;

    public override finalAmount: number;
    public purchaseRate: number;
    public marginPercentage: number;
}
