import { HSMargin } from './../poc/margin';
import { PocDetail } from './../poc/pocDetails';
import { FinancialTransaction } from './financialtransaction';
export class FinancialTransactionWithMargin extends FinancialTransaction {
    public pocMargin: number;
    public hsMargin: number;
    public doctorMargin: number;
    public brandPocMargin: number;
    public onboardingPocMargin: number;
    public bookingPocMargin: number;

    public pocMarginFee: number;
    public hsMarginFee: number;
    public doctorMarginFee: number;
    public brandPocMarginFee: number;
    public onboardingPocMarginFee: number;
    //public   bookingPocMargin:number;

    public pocMargins: PocDetail;
    public brandMargins: Array<HSMargin>;
    public employeeMargins: HSMargin;
    public bookingPocMargins: HSMargin;
    public onboardingPocMargins: HSMargin;
    
    public areaId: number;
    public pocId: number;
    public brandId: number;
    public appId: number;
    public brandPocId: number;
    public couponOwner: number;
    public packageOwner: number;
    public userRegisteredPocId: number;
    public userOnboardingPocId: number;

    public creditLimit: number;

    public participateInTransferPricing: boolean;

} 