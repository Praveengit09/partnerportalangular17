import { BaseResponse } from '../base/baseresponse';
import { PocDetail } from '../poc/pocDetails';
import { RegistrationVO } from '../profile/registrationVO';

export class BulkPackage extends BaseResponse {
    public packageId: number;
    public packageName: string;
    public excelUrl: string;

    public fromDate: number;
    public toDate: number;
    public packageCreatedDate: number;
    public paymentStatus: number;
    public amount: number;
    public billingType: number;
    public transactionType: number;
    public invoiceId: string;
    public orderId: string;
    public baseOrderId: string;
    public pdfUrlWithHeader: string;
    public pdfUrlWithoutHeader: string;
    public updatedTimestamp: number;

    public pocId: number;
    public pocName: string;
    public pocDetails: PocDetail;

    public empId: number;

    public profileId: number;
    public profileDetails: RegistrationVO;
    public fName: string;
    public lName: string;
    public mobile: string;
    public email: string;

    public stateId: number;
    public cityId: number;
    public areaId: number;
}

