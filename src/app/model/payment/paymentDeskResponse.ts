import { SlotBookingDetails } from './../../model/basket/slotBookingDetails';
import { ProfileDetail } from './../../model/profile/profileDetail';

export class PaymentDeskResponse {
    public transactionId: string;
    public transactionType: number;
    public status: number;
    public discountAmount: number;
    public originalAmount: number;
    public finalAmount: number;
    public orderId: any;
    public invoiceId: string;
    public basketType: number;
    public bookingSource: number;
    public createdTimestamp: number;
    public updatedTimestamp: number;
    public deliveryType: number;
    public slotBookingDetails: SlotBookingDetails;
    public profile: ProfileDetail = new ProfileDetail();
}
