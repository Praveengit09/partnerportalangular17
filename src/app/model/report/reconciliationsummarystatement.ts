import { POCInvoiceSummary } from './pocInvoiceSummary';
export class ReconciliationSummaryStatement {
    public hsRevenue: number;
    public pocRevenue: number;
    public totalPayableAmount: number;
    public totalReceivableAmount: number;
    public periodicSummaryFinancialStatementList: Array<POCInvoiceSummary>;
}