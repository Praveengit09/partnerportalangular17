import { BaseFinancialTransaction } from './basefinancialtransaction';
import { BasketDiscount } from './../package/basketDiscount';
import { Payment } from './../basket/payment';
export class FinancialTransaction extends BaseFinancialTransaction {
    public createdTime: number;
    public empId: number;
    public doctorId: number;
    public payment: Payment;
    public bookingType: number;
    public bookingSource: number;
    public paymentSource: number;
    public bookingSubType: number;
    public cartItemType: number;
    public bookingPocId: number;
    public deliveryType: number;
    public deliveryAmount: number;
    public basketDiscount: Array<BasketDiscount>;
    public patientFirstName: string;
    public patientLastName: string;
    public doctorFirstName: string;
    public doctorLastName: string;
    public pocName: string;
    public pdfUrl: string;
    public pocRevenue: number;
    public hsRevenue: number;
    public doctorRevenue: number;
    public brandPocRevenue: number;
    public onboardingPocRevenue: number;
    public bookingPocRevenue: number;
    public employeeRevenue: number;
    public receivableAmount: number;
    public payableAmount: number;
    public transactionPocRevenue: number;

    public transactionReportId: string;
    public transactionPocId: number;

    public brandName: string;
}