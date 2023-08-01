import { BrandPeriodicFinancialStatement } from './brandperiodicfinancialstatement';

export class TotalBrandRevenueFinancialStatement {
    public fromDate: number;
    public toDate: number;
    public totalBrandRevenue: number;
    public totalHsRevenue: number;
    public brandPeriodicFinancialStatementList: Array<BrandPeriodicFinancialStatement>;
}