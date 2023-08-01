import { Payment } from './payment';
import { BasketDiscount } from './../../model/package/basketDiscount';
import { TransactionHistory } from './../../model/basket/transactionHistory';
import { ProfileDetailsVO } from './../../model/profile/profileDetailsVO';
import { Address } from './../../model/profile/address';
import { BaseResponse } from './../../model/base/baseresponse';
import { DoctorDetails } from '../employee/doctordetails';
import { PocAdviseData } from '../poc/poc-advise-data';
import { ReferredBy } from './referredBy'
export class InvoiceBaseDetails extends BaseResponse {
    public orderId: string;
    public invoiceId: string;
    public baseInvoiceId: string;
    public referenceId: string;
    public parentInvoiceId: string;
    public patientProfileId: number;
    public parentProfileId: number;
    public patientRelationship: number;
    public parentServiceId: number;
    public doctorId: number;
    public serviceId: number;
    public serviceName: string;
    public parentServiceName: string;
    public pocId: number;
    public bookingPocId: number;
    public appId: number;
    public brandId: number;
    public empId: number;
    public adviceId: number;
    public bookingSource: number;
    public paymentSource: number;
    public bookingSubType: number;
    public userPackageId: number;
    public packageName: string;
    public basketDiscount: BasketDiscount[] = new Array<BasketDiscount>();
    public invoiceCompletionStatus: number;
    public cancellationStatus: number;
    public refundStatus: number;
    public returnStatus: number;
    public cancellationExpiryDate: string;
    public payment: Payment = new Payment();

    public instrumentType: number;

    public createdTimestamp: number;
    public updatedTimestamp: number;
    public orderPlacedTimestamp: number;

    public pdfUrlWithHeader: string;
    public pdfUrlWithoutHeader: string;

    public deliveryAddress: Address;
    public billingAddress: Address;
    public deliveryType: number;
    public deliveryAmount: number;
    public transactionHistoryList: TransactionHistory[] = new Array<TransactionHistory>();
    public patientProfileDetails: ProfileDetailsVO = new ProfileDetailsVO();
    public pocDetails: PocAdviseData;
    public doctorDetail: DoctorDetails;
    public actualDate: number;
    public addToConsultationQueue: boolean;
    public packageDiscountSource: number;
    public excelPackage: boolean;
    public additionalMessage: string;

    public internalBrandRequest: boolean;
    public inPatientBilling: boolean;
    public alternateMobile: string;
    public afterPrescriptionGeneration: boolean;
    public b2bUserOrder: number;

    //local use //transient variable
    public enableCancel: number;
    public referredByBooking: ReferredBy;
    public walletApply: boolean;
    public tempStatus: number;
    public phleboAccepted: boolean;

}
