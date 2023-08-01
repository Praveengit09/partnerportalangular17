import { DiagnosticsAdviseTrack } from './diagnosticsAdviseTrack';
import { CartItem } from './../basket/cartitem';

export class StatusDiagnosticsAdviseTrack {
    
    public statusFlag:number;
    public actionFlag:number;
    public diagnosticsAdvise:CartItem;

    constructor(diagnosticsAdviseTrack: CartItem){
     
       this.diagnosticsAdvise=diagnosticsAdviseTrack;

        this.statusFlag= 0; //New
        console.log("inside constructor");
        if(diagnosticsAdviseTrack.payment.paymentStatus!=1 && diagnosticsAdviseTrack.payment.transactionType==5){//if payment is not paid and transaction type is mobile 
                this.statusFlag=1 ;//Pending
        }
        // else if(diagnosticsAdviseTrack.payment.paymentStatus==1){//if payment is paid
        //     if(diagnosticsAdviseTrack.payment.adviseStatus==1){
        //         this.statusFlag=2; //Paid
        //     }
        //     if(diagnosticsAdviseTrack.adviseStatus==2){
        //         this.statusFlag=3 ;//Partial Report
        //     }
        //     if(diagnosticsAdviseTrack.adviseStatus==3){
        //         this.statusFlag=4; //Full Report
        //     }
        // }

      this.actionFlag=0; //View
      //If payment is paid and all test result are uploaded
    //   if(diagnosticsAdviseTrack.payment.paymentStatus==1 && diagnosticsAdviseTrack.adviseStatus==3){
    //       this.actionFlag=1; //Completed
    //   }
      if(this.statusFlag == 1){
          this.actionFlag = 2; // Pending
      }
    }
     
}