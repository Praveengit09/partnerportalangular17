import { UpdateReconciliationStatement } from './updatereconciliationstatement';
import { FinancialTransactionWithMargin } from './financialtransactionwithmargin';
import { SummaryTransactions } from './summarytransactions';
import { PocDetail } from './../poc/pocDetails';
export class PeriodcFinancialStatement {
    public pocId: number;
    public pocName: string;
    public invoiceFromDate: number;
    public invoiceToDate: number;
    public totalRevenue: number;
    public totalReceivableAmount: number;
    public totalPayableAmount: number
    public totalTransactionsCount: number;
    public invoiceId: string;
    public reconciliationStatus: number;
    //public reconciliationAmount: number;
    public reconciliationPendingAmount: number;
    public summaryTransactionsList: Array<SummaryTransactions>;
    public financialTransactionWithMargin: Array<FinancialTransactionWithMargin>;
    public updateReconciliationStatementList:Array<UpdateReconciliationStatement>;
    public pdfUrl: string;
    public pocDetails: PocDetail;
    public invoiceType: number;
    public pocPayable:boolean;
    public reconciledAmount:number;
    public comment:string;
    public receivable:number;
    public payable:number;
}