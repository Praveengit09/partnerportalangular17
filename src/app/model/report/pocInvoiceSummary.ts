import { PeriodcFinancialStatement } from './periodicfinancialstatement ';
export class POCInvoiceSummary {
    public pocId: number;
    public pocName: string;
    public totalRevenue: number;
    public hsRevenue: number;
    public totalReceivableAmount: number;
    public totalPayableAmount: number
    public totalTransactionsCount: number;
    public reconciliationAmount: number;
    public reconciliationPendingAmount: number;
    public periodicFinancialStatementList: Array<PeriodcFinancialStatement> = new Array<PeriodcFinancialStatement>();
}