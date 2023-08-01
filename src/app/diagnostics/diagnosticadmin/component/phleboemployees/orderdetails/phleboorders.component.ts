import { Component, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { CommonUtil } from './../../../../../base/util/common-util';
import { SpinnerService } from './../../../../../layout/widget/spinner/spinner.service';
import { DeliveryDetailsOfAllEmployees } from './../../../../../model/diagnostics/deliveryDetailsOfAllEmployees';
import { DiagnosticAdminService } from './../../../diagnosticadmin.service';

@Component({
    selector: 'phleboorders',
    templateUrl: './phleboorders.template.html',
    styleUrls: ['./phleboorders.style.scss'],
    encapsulation: ViewEncapsulation.Emulated,
})

export class PhleboOrderComponent {

    startDate: Date = new Date();
    phleboOrder: DeliveryDetailsOfAllEmployees;
    date: number;
    empId: number;
    employeeName: string;

    datepickerOpts = {
        autoclose: true,
        todayBtn: 'linked',
        todayHighlight: true,
        assumeNearbyYear: true,
        format: 'dd/mm/yyyy'
    };

    constructor(private diagAdminService: DiagnosticAdminService, private commonUtil: CommonUtil,
        private router: Router, private spinnerService: SpinnerService) {
        this.phleboOrder = this.diagAdminService.phleboOrder;
        this.date = this.phleboOrder.date ? this.phleboOrder.date : 0;
        this.empId = this.phleboOrder.empId;
        this.employeeName = this.phleboOrder.firstName + ' ' + this.phleboOrder.lastName;
        this.startDate = this.diagAdminService.date;
        this.getPhleboOrders();
    }

    getPhleboOrders() {
        this.diagAdminService.getPhlebomistOrders(this.empId, this.date).then(response => {
            this.spinnerService.stop();
            if (response)
                this.phleboOrder = response;
            else {
                this.phleboOrder = new DeliveryDetailsOfAllEmployees();
            }
        });
    }

    startDateChoosen($event): void {
        this.date = this.startDate != null ? this.commonUtil.convertOnlyDateToTimestamp(this.startDate) : 0;
        this.getPhleboOrders();
    }

    onGenerateBack() {
        this.router.navigate(['/app/diagnostics/diagnosticadmin/phlebolist'])
    }

}