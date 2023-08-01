import { CartItem } from '../basket/cartitem';

export class ProductDeliveryTrack {

    public static NEW: number = 0;
    public static COMPLETED = ProductDeliveryTrack.NEW + 1;//1
    public static PENDING_CUSTOMER_APPROVAL = ProductDeliveryTrack.COMPLETED + 1;//2
    public static CUSTOMER_APPROVED = ProductDeliveryTrack.PENDING_CUSTOMER_APPROVAL + 1;//3
    public static REJECTED = ProductDeliveryTrack.CUSTOMER_APPROVED + 1;//4
    public static CANCELLED = ProductDeliveryTrack.REJECTED + 1;//5
    public static VENDOR_DELIVERY_INITIATED = ProductDeliveryTrack.CANCELLED + 1;//6
    public static PENDING_VENDOR_DELIVERY_APPROVAL = ProductDeliveryTrack.VENDOR_DELIVERY_INITIATED + 1;//7
    public static VENDOR_APPROVED = ProductDeliveryTrack.PENDING_VENDOR_DELIVERY_APPROVAL + 1;//8
    public static VENDOR_REJECTED = ProductDeliveryTrack.VENDOR_APPROVED + 1;//9
    public static CUSTOMER_RETURN_REQESTED = ProductDeliveryTrack.VENDOR_REJECTED + 1;//10
    public static VENDOR_RETURN_COLLECTION_INITIATED = ProductDeliveryTrack.CUSTOMER_RETURN_REQESTED + 1;//11
    public static OUT_FOR_DELIVERY= ProductDeliveryTrack.VENDOR_RETURN_COLLECTION_INITIATED + 1;//12);
    public static DELIVERED= ProductDeliveryTrack.OUT_FOR_DELIVERY + 1;//13);
    public static LIVE= ProductDeliveryTrack.DELIVERED + 1;//14);
    public static DELIVERY_INITIATED= ProductDeliveryTrack.LIVE + 1;//15);
    public static UPDATE= ProductDeliveryTrack.DELIVERY_INITIATED + 1;//16);

    // zoomAudio 2
    public deliveryRequestId: number;
    public actionStatus: number;

    public baseInvoiceId: string;
    public orderId: string;

    public cartItem: CartItem;

    public empId: number;
    public empFirstName: String;
    public empLastName: String;
    public remarks: string;
    public updatedTime: number;

    public cashPaymentAmount: number;
    public onlinePaymentAmount: number;
    public totalAmount: number;

    public rejectionCount: number;
    public pocIdRejectionMap: any;
    public adminReassignment: boolean;
    public reassignmentTime: number;
    public employeeAccepted: string;
    public orderRequest = 1;

    // Local variables
    public address: string;
    public billingAddress: string;
    public state: string;
    public city: string;
    public products: string;
    public creatorName: string;
}