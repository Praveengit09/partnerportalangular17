import { ServiceItem } from '../service/serviceItem';

export class InvestigationPrecautionRequest {
   public serviceIdList:Array<ServiceItem>=new Array<ServiceItem>();
   public precaution:string;

}