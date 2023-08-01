export class DiagnosticAdminRequest {

  //phleboRequest
  public static ALL_ORDERS: number = 0;
  public static ACCEPTED_PENDING_ORDERS: number = DiagnosticAdminRequest.ALL_ORDERS + 1;
  public static ACCEPTED_COLLECTED_ORDERS: number = DiagnosticAdminRequest.ACCEPTED_PENDING_ORDERS + 1;
  public static NEW_ORDERS: number = DiagnosticAdminRequest.ACCEPTED_COLLECTED_ORDERS + 1;
  public static ACCEPTED_ALL_ORDERS: number = DiagnosticAdminRequest.NEW_ORDERS + 1;
  public static DELIVERY_DELIVERED: number = DiagnosticAdminRequest.ACCEPTED_ALL_ORDERS + 1;
  public static DELIVERY_PENDING: number = DiagnosticAdminRequest.DELIVERY_DELIVERED + 1;
  public static DELIVERY_ALL: number = DiagnosticAdminRequest.DELIVERY_PENDING + 1;
  public static WALKIN_ORDERS: number = DiagnosticAdminRequest.DELIVERY_ALL + 1;
  public static APPOINTMENTS: number = DiagnosticAdminRequest.WALKIN_ORDERS + 1;

  public pocId: number;
  public state: number;
  public city: number;
  public area: number;
  public empId: number;
  public fromIndex: number;
  public pageSize: number = 50;
  public orderId: string;
  public mobile: string;
  public searchTerm: string;
  public pinCode: string;
  public employeeRequest: number;
  public date: number;
  public fromDate: number;
  public toDate: number;
  public pocIdList: number[] = new Array();
  public sampleCollectionStatus: number;
  public isExcel: boolean = false;
  public toEmail: string = "";
  public emailReportId: number = 0;
  // public scrollPosition : number;    
}