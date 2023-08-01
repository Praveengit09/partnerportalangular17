import { BasePocDetails } from "./basePocDetails";

export class SubTypeAdvise {
  public id: number;
  public adviceId: number;
  public startDate: number;
  public endDate: number;
  public status: number;
  public profileId: number;
  public invoiceId: string;
  public doctorId: number;
  public doctorName: string;
  public adviseGeneratedTime: number;
  public subTypeId: number;
  public routedToPoc: Array<BasePocDetails>;
  public routedFromPoc: BasePocDetails;
  public paymentStatus: number;
  public adviseStatus: number;
  public parentProfileId: number;
  public orderId: string;
  public purchaseType: number;
  public transactionId: string;
}
