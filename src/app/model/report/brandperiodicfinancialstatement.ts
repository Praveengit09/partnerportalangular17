import { BrandPocPerCategoryRevenue } from './brandpocpercategoryrevenue';

export class BrandPeriodicFinancialStatement {
    public brandId: number;
    public date: number;
    public brandRevenue: number;
    public hsRevenue: number;
    public brandPocPerCategoryRevenueList: Array<BrandPocPerCategoryRevenue>;

    //Local
    public revenuePerCategory: string;
}