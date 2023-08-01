import { SummaryReport } from './../../model/report/summaryreport';

export class FinancialSummaryReport {
    public pocId: number;
    public pocName: string;
    public totalRevenue: number;
    public totalCashFlow: number;
    public totalReceivables: number;
    public totalHSCashFlow: number;
    public totalHSRevenue: number;
    public reportId:number;
    public empId:number;
    public firstName:string;
    public lastName:string;
    public remarks:string;
    public reconciliationStatus:number;
    public updatedDate:number;
    public financialPdfUrl:string;
    public reportList: Array<SummaryReport>;
}
