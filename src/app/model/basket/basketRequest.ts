import { SlotBookingDetails } from './slotBookingDetails';
import { ProfileDetailsVO } from './../../model/profile/profileDetailsVO';
import { CartItem } from './../../model/basket/cartitem';
import { BaseResponse } from './../../model/base/baseresponse';
import { Taxes } from './../../model/basket/taxes';
export class BasketRequest extends BaseResponse {
    public appId: number;
    public orderId: any;
    public bookingSource: number;
    public transactionSource: number;
    public transactionType: number;
    public transactionId: string;
    public paymentId: string;
    public parentProfileId: number;
    public slotBookingDetailsList: SlotBookingDetails[] = [];
    public cartItemList: CartItem[] = new Array();
    public payable: boolean;// - This field is added to indicate if the invoice can be paid from the order history or not
    public createdTimestamp: number;
    public updatedTimestamp: number;

    public orderPaymentStatus: number;
    public paidItemsCount: number;
    public notPaidItemsCount: number;
    public Type: string;   //temporary
    public paymentStatus: number;   //temporary
    public totalTaxes: Taxes;
    public totalOriginalAmount: number;
    public totalPackageDiscountAmount: number;
    public totalOtherDiscountAmount: number;
    public totalTaxationAmount: number;
    public totalFinalAmount: number;

    public pdfUrlWithHeader: string;
    public pdfUrlWithoutHeader: string;

    public partialPayment: boolean;
    public payUParameters: any;

    public parentProfileDetails: ProfileDetailsVO;

    public pocId: number;
    public empId: number;
}
