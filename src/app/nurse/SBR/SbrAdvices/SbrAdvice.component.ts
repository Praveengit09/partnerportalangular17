import { Component, ViewEncapsulation } from '@angular/core';
import { SelectedRegisteredProfile } from '../../../model/profile/selectedRegisteredProfile';
import { NurseService } from '../../nurse.service';
import { ReceptionService } from '../../../reception/reception.service';
import { PriscriptionApprovalRequest } from '../../../model/reception/prescription/prescriptionApprovalRequest';
import { Router } from '@angular/router';
import { ConsumerApprovalRequest } from '../../../model/reception/prescription/consumerApprovalRequest';
import { PurchaseDetails } from '../../../model/reception/prescription/purchaseDetails';

@Component({
    selector: 'SbrAdviceComponent',
    templateUrl: './SbrAdvice.template.html',
    styleUrls: ['./SbrAdvice.style.scss'],
    encapsulation: ViewEncapsulation.None
})
export class SBRAdviceComponent {
    selectedRegisteredProfile: SelectedRegisteredProfile = new SelectedRegisteredProfile();
    SBRAdvices: any;
    tablets: any;
    notes: any;
    nonMedications: any;
    constructor(private nurseService: NurseService, private recepService: ReceptionService, private router: Router) {

    }

    ngOnInit(): void {
        this.SBRAdvices = this.nurseService.getSBRAdvicesResponse();
        this.tablets = this.SBRAdvices.pharmacyAdviceList[0].pharmacyAdviceList;
        this.notes = this.SBRAdvices.noteList[0].adviceList;
        this.nonMedications = this.SBRAdvices.nonMedicationAdviceList[0].adviceList;
    }

    OnAcceptReject(index: number) {
        let request: PriscriptionApprovalRequest = new PriscriptionApprovalRequest();
        request.consumerApprovalRequest = new ConsumerApprovalRequest()
        request.consumerApprovalRequest.pharmacyPurchase = request.consumerApprovalRequest.diagnosticPurchase = new PurchaseDetails();
        request.consumerApprovalRequest.pharmacyPurchase.purchaseType = 0;
        request.consumerApprovalRequest.diagnosticPurchase.purchaseType = 0;
        // request.consumerApprovalRequest.emp
        request.adviceId = this.SBRAdvices.adviceId;
        request.status = index;
        this.recepService.submitPriscriptionForApproval(request).then(response => {
            if (index == 2) {
                alert("Your Advice Accepted Successfully");
            }
            else {
                alert("Your Advice Rejected ");
            }
            this.router.navigate(['/app/nurse/SBR']);
        });
    }

}
