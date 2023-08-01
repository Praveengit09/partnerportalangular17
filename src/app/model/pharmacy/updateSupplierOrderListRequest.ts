import { StockOrder } from '../inventory/stockReportResponse';
import { SupplierDetails } from '../inventory/supplierDetails';
export class UpdateSupplierOrderListRequest {

    public pocId: number;
    public orderFormat: number; // pdf -->1 else 2
    public productList: Array<StockOrder> = new Array();

    public supplierDetails: SupplierDetails = new SupplierDetails();

    public productName: string;
    public productId: number;
    public additionalMessage: string;

    public itemType: boolean;
}
