import { PaymentIncentiveMargin } from './paymentIncentivemargin';
import { Ranges } from './ranges';
export class PartnerIncentives {
    public doctorBookings: PaymentIncentiveMargin = new PaymentIncentiveMargin();
    public diagnosticBookings: PaymentIncentiveMargin = new PaymentIncentiveMargin();
    public pharmacySales: PaymentIncentiveMargin = new PaymentIncentiveMargin();
    public productSales: PaymentIncentiveMargin = new PaymentIncentiveMargin();
    public procedureSales: PaymentIncentiveMargin = new PaymentIncentiveMargin();
    public immunizationSales: PaymentIncentiveMargin = new PaymentIncentiveMargin();
    public wellnessSales: PaymentIncentiveMargin = new PaymentIncentiveMargin();
    public revenueIncentives: Array<Ranges> = new Array<Ranges>();
    ;
}