import { PaymentGatewayParameters } from '../payment/paymentGatewayParameters';
import { PocDetail } from '../poc/pocDetails';
import { CartItem } from './cartitem';

export class BBCartItem extends CartItem {

    public purchaserPocId: number;
    public purchaserEmpId: number;

    public senderPocId: number;

    public purchaserPocDetails: PocDetail;

    public override returnStatus: number;
    public referenceId2: string;

    public orderFileDetails: string;
    public consolidatedMailStatus: number = 0;
    public subscriptionRenewal: boolean = false;
    public paymentGatewayParameters: PaymentGatewayParameters;

    public supplierNote: string;
    public pharmacyNote: string;

    //for local 
    public transferType: string;
    public transferPocName: string;
}