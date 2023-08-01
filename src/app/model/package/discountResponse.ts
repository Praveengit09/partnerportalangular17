import { BookedPackageResponse } from './../../model/package/bookedPackageResponse';
import { BasketDiscount } from './basketDiscount';

export class DiscountResponse {
    public packageDiscountList: Array<BookedPackageResponse>;
    public otherDiscountList: Array<BasketDiscount>;
}
