import { BaseResponse } from './../../model/base/baseresponse';

export class ReportResponse extends BaseResponse {
    public doctorId: number;
    public doctorFirstName: string;
    public doctorLastName: string;
    public count: number;
    public finalAmount: number;
    public originalAmount: number;
    public packageDiscountAmount: number;
    public otherDiscountAmount: number;
    public taxationAmount: number;
    public deliveryAmount: number;
    public brandId: number;
    public appId: number;
    public date: number;
    public pocId: number;
    public pocName: string;
    public bookingPocId: number;
    public bookingPocName: string;
    public areaId: number;
    public bookingAreaId: number;
    public transactionType: any;
    public basketType: any;
    public bookingSource: any;
    public discountType: any;
    public cancellationStatus: any;
    public packageOwner: number;
    public flag: any;
    public subFlag: any;
    public invoiceIdList: Array<string>;

    public hsMargin: number;
    public hsConsultationMargin: number;
    public walkinConsultationMargin: number;
    public hsInvestigationMargin: number;
    public hsWellnessMargin: number;
    public hsPharmacyMargin: number;
    public hsImmunizationMargin: number;
    public hsProcedureMargin: number;
    public hsPackageMargin: number;
    public hsOnboardingPackageMargin: number;
    public partnerOnboardingMargin: number;
    public digiMargin: number;
    public onboardingMargin: number;
    public summaryLabel: string;

    public doctorHSPackageMargin: number;
    public doctorHSConsultationMargin: number;

    public totalRevenue: number;
    public totalCashFlow: number;
    public totalReceivables: number;
    public totalHSCashFlow: number;
    public totalHSRevenue: number;
    public averageWatingTime: number;
    public averageConsultationTime: number;
    public averageVisitTime: number;
    public averageQueueTimeForPharmacyOrders: number;
    public averageQueueTimeForDiagsnoticsOrders: number;
    public averageQueueTimeForPayment: number;

    public totalPayables: number;
    public totalBillAmount: number;

    public time: number;

    public invoiceId: string;
    public orderId: string;
    public referenceId: string;
    public pdfUrl: string;

    public transactionPartnerType: number;

    public transactionId: string;
    public paymentId: string;
    public brandName: string;

    public percentageChange: number;
}
