import { DiagnosticDeliveryAdviceTrack } from './../../model/diagnostics/diagnosticListForAdmin';
export class StatusDiagnosticsAdmin {
    public paymentStatusFlag: number;
    public actionFlag: number;
    public diagnosticListAdmin: DiagnosticDeliveryAdviceTrack;

    constructor(diagnosticListAdminTrack: DiagnosticDeliveryAdviceTrack) {

        this.diagnosticListAdmin = diagnosticListAdminTrack;

        this.paymentStatusFlag = 0; //NOT PAID
        console.log("inside constructor");
        // if(diagnosticListAdminTrack.paymentStatus!=1 && diagnosticListAdminTrack.transactionType==5){//if payment is not paid and transaction type is mobile
        //         this.paymentStatusFlag=1 ;//Pending
        // }
        // else if(diagnosticListAdminTrack.paymentStatus==1){//if payment is paid
        //     if(diagnosticListAdminTrack.adviseStatus==1){
        //         this.paymentStatusFlag=2; //Paid
        //     }
        //     if(diagnosticListAdminTrack.adviseStatus==2){
        //         this.paymentStatusFlag=3 ;//Partial Report
        //     }
        //     if(diagnosticListAdminTrack.adviseStatus==3){
        //         this.paymentStatusFlag=4; //Full Report
        //     }
        // }
        // if(diagnosticListAdminTrack.paymentStatus==1){//if payment is paid
        //     if(diagnosticListAdminTrack.sampleCollectionStatus==2){
        //         this.paymentStatusFlag=2; //Paid
        //     }}

        this.actionFlag = 1; //MARK COLLECTED
        //If payment is paid and all test result are uploaded
        if (diagnosticListAdminTrack.sampleCollectionStatus == DiagnosticDeliveryAdviceTrack.COLLECTED) {
            this.actionFlag = diagnosticListAdminTrack.sampleCollectionStatus; //COLLECTED

        }
        if (diagnosticListAdminTrack.payment.paymentStatus == 1) {
            this.paymentStatusFlag = 1; //Paid
        }
    }
}
