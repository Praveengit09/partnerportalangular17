import { BusinessAdminService } from './../../../../../businessadmin/businessadmin.service';
import { LocationModeResponse } from './../../../../../model/common/locationmoderesponse';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { AuthService } from './../../../../../auth/auth.service';
import { CommonUtil } from './../../../../../base/util/common-util';
import { SpinnerService } from './../../../../../layout/widget/spinner/spinner.service';
import { DeliveryDetailsOfAllEmployees } from './../../../../../model/diagnostics/deliveryDetailsOfAllEmployees';
import { DiagnosticAdminService } from './../../../diagnosticadmin.service';
import { Router } from '@angular/router';


@Component({
    selector: 'phlebolist',
    templateUrl: './phlebolist.template.html',
    styleUrls: ['./phlebolist.style.scss'],
    encapsulation: ViewEncapsulation.Emulated,

})
export class PhlebolistComponent implements OnInit {

    empId: number;
    pocId: number;
    stateId: number = 0;
    cityId: number = 0;
    indexForCity: number = 0;
    indexForState: number = 0;
    startDate: Date = new Date();
    date: number = 0;
    responseList: Array<DeliveryDetailsOfAllEmployees>;
    phleboOrder: DeliveryDetailsOfAllEmployees = new DeliveryDetailsOfAllEmployees();
    stateResponse: LocationModeResponse[] = [];
    cityResponse: LocationModeResponse[] = [];
    errorMessage: Array<string>;
    isError: boolean;
    showMessage: boolean;
    perPage: number = 10;
    total: number = 0;
    dataMsg: string = ' ';

    datepickerOpts = {
        autoclose: true,
        todayBtn: 'linked',
        todayHighlight: true,
        assumeNearbyYear: true,
        format: 'dd/mm/yyyy'
    };


    columns: any[] = [
        {
            display: 'Phlebo Details',
            variable: 'firstName  lastName',
            filter: 'text',
            sort: true
        },
        {
            display: 'Accepted Orders',
            variable: 'noOfOrderAcceptedByThisEmployee ',
            filter: 'text',
            sort: false
        },
        {
            display: 'Completed Orders',
            variable: 'noOfOrderCollectedByThisEmployee ',
            filter: 'text',
            sort: false
        },
        {
            display: 'Action',
            label: 'VIEW',
            style: 'btn btn-danger width-130 mb-xs botton_txt done_txt',
            filter: 'action',
            type: 'button',
            event: 'viewButton',
            sort: false,
            variable: 'phleboAcceptedOrders',
            conditions: [
                {
                    condition: 'default',
                    label: 'VIEW',
                    style: 'btn btn-danger width-130 mb-xs botton_txt done_txt'
                }
            ]
        },
        {
            display: 'Collection Status',
            label: 'VIEW',
            filter: 'action',
            type: 'button',
            event: 'cashcollected',
            sort: false,
            variable: 'cashCollectedStatus',
            conditions: [
                {
                    value: 'false',
                    condition: 'eq',
                    label: 'Collect Cash',
                    style: 'btn btn-danger width-130 mb-xs botton_txt done_txt'
                },
                {
                    value: 'true',
                    condition: 'eq',
                    label: 'Collected',
                    style: 'btn width-100 mb-xs botton_txtdigo hide_btndigo disabled'
                }
            ]
        }
    ];

    constructor(private spinnerService: SpinnerService, private diagAdminService: DiagnosticAdminService, private businessadminService: BusinessAdminService,
        private commonUtil: CommonUtil, private router: Router,
        private authService: AuthService) {
        this.empId = this.authService.userAuth.employeeId;
        this.pocId = this.authService.userAuth.pocId;
    }

    ngOnInit() {
        this.getState();
        this.getPlebotomistlist();
    }

    getPlebotomistlist() {

        this.spinnerService.start();
        this.dataMsg = 'Loading...';
        this.diagAdminService.getPhlebomistlist(this.pocId, this.empId, this.stateId, this.cityId, this.date).then(response => {
            this.spinnerService.stop();
            if (response.length > 0)
                this.responseList = response;
            else {
                this.dataMsg = "No Data Found";
                this.responseList = new Array<DeliveryDetailsOfAllEmployees>();
            }
            this.total = this.responseList.length;
        });
        console.log("response----->", JSON.stringify(this.responseList));
    }

    clickEventHandler(e) {
        if (e.event == "viewButton") {
            this.onButtonClicked(e.val);
        } else if (e.event == 'cashcollected') {
            this.changeCashCollected(e.val);
        }
    }


    getState(): void {
        this.stateId = 0;
        this.cityId = 0;
        this.businessadminService.getLocation(this.empId, this.stateId, this.cityId).then(locationResponse => {
            this.stateResponse = locationResponse;
            this.stateResponse.sort(this.compare);
            console.log("stateresponse: " + JSON.stringify(this.stateResponse));
        });
    }


    onStateChange(index: number): void {

        this.cityId = 0;
        this.stateId = (index > 0 ? this.stateResponse[index - 1].id : index);
        this.indexForCity = 0;
        if (index != 0) {
            this.businessadminService.getLocation(this.empId, this.stateId, this.cityId).then(locationResponse => {
                this.cityResponse = locationResponse;
                this.cityResponse.sort(this.compare);
                console.log("LocationDeatails for City For Login Emp:: " + JSON.stringify(this.cityResponse));
            });
            this.getPlebotomistlist();
        }
    }


    onCityChange(index: number): void {

        this.cityId = (index > 0 ? this.cityResponse[index - 1].id : index);
        this.getPlebotomistlist();
    }


    compare(a, b): number {
        if (a.name < b.name)
            return -1;
        if (a.name > b.name)
            return 1;
        return 0;
    }

    onButtonClicked(order: DeliveryDetailsOfAllEmployees) {
        this.diagAdminService.phleboOrder = order;
        this.diagAdminService.date = this.startDate;
        this.router.navigate(['/app/diagnostics/diagnosticadmin/phleboorder'])
    }

    changeCashCollected(order: DeliveryDetailsOfAllEmployees) {
        this.phleboOrder = order;
        (<any>$)('#updatecashcollection').modal('show');
    }

    startDateChoosen($event): void {
        this.date = this.startDate != null ? this.commonUtil.convertDateToTimestamp(this.startDate) : 0;
        this.total = 0;
        this.responseList = new Array<DeliveryDetailsOfAllEmployees>();
        this.getPlebotomistlist();
    }

    updateCashCollectionsStatus() {
        this.spinnerService.start();
        this.diagAdminService.changeCashCollectStatusForPhlebo(this.phleboOrder.empId, this.phleboOrder.date).then(response => {
            this.spinnerService.stop();
            if (response.statusCode == 200) {
                this.date = this.phleboOrder.date;
             window.alert('Amount was collected');
            }
            else {
                window.alert('Something went wrong,please try again');
            }
        });
        this.getPlebotomistlist();
    }
}