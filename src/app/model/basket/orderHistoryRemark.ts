import { Employee } from "./../../model/employee/employee";
import { OrderHistory } from "./../../model/basket/orderHistory"
import { BasketRequest } from './basketRequest';

export class OrderHistoryRemark extends BasketRequest {
    public static REMARK_NOT_TAKEN: number = 0;
    public static REMARK_TAKEN: number = OrderHistoryRemark.REMARK_NOT_TAKEN + 1;
    public override empId: number;
    public invoiceId: any;
    public remark: string;
    public remarkStatus: number;
    public employee: Employee;
    public updatedTime: number;
  
}
