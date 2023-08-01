import { BrandPerPocRevenue } from './brandperpocrevenue';

export class BrandPocPeriodicFinancialStatement {
    public brandId: number;
    public fromDate: number;
    public toDate: number;
    public totalPocRevenue: number;
    public totalHsRevenue: number;
    public brandPerPocRevenueList: BrandPerPocRevenue[];
}