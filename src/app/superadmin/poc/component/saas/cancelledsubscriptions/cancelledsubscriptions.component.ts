import { Component, ViewEncapsulation } from "@angular/core";
import { AppConfig } from "../../../../../app.config";
import { SpinnerService } from "../../../../../layout/widget/spinner/spinner.service";
import { saasSubscriptionsService } from "../saassubscriptions.service";

@Component({
    selector: 'cancelledsubscriptions',
    templateUrl: './cancelledsubscriptions.template.html',
    styleUrls: ['./cancelledsubscriptions.style.scss'],
    encapsulation: ViewEncapsulation.None
})

export class CancelledSubscriptionsComponent {

    //   columns: any[] = [
    //     {
    //       display: 'Order ID',
    //       variable: 'orderId',
    //       filter: 'action',
    //       event: 'orderidlink',
    //       style: 'orderId',
    //       type: 'hyperlink',
    //       sort: false
    //     },
    //     {
    //       display: 'Customer Details',
    //       variable: 'slotBookingDetailsList[0].patientProfileDetails.title slotBookingDetailsList[0].patientProfileDetails.fName slotBookingDetailsList[0].patientProfileDetails.lName  , slotBookingDetailsList[0].patientProfileDetails.contactInfo.mobile , slotBookingDetailsList[0].patientProfileDetails.contactInfo.email',
    //       filler: ',',
    //       filter: 'nametitle',
    //       sort: false
    //     },
    //     {
    //       display: 'Center Details',
    //       variable: 'slotBookingDetailsList[0].pocDetails.pocName',
    //       filler: ',',
    //       filter: 'nametitle',
    //       sort: false
    //     },
    //     {
    //       display: 'Doctor Details',
    //       variable: 'slotBookingDetailsList[0].doctorDetail.firstName slotBookingDetailsList[0].doctorDetail.lastName',
    //       filler: ',',
    //       filter: 'nametitle',
    //       sort: false
    //     },
    //     {
    //       display: 'Booking Type',
    //       variable: 'slotBookingDetailsList[0].bookingType',
    //       filter: 'text',
    //       sort: false,
    //       conditions: [
    //         {
    //           value: '1',
    //           condition: 'eq',
    //           label: 'Doctor - Connect Now'
    //         },
    //         {
    //           value: '3',
    //           condition: 'eq',
    //           label: 'Doctor'
    //         },
    //         {
    //           value: '4',
    //           condition: 'eq',
    //           label: 'Wellness'
    //         },
    //         {
    //           value: '5',
    //           condition: 'eq',
    //           label: 'Diagnostics'
    //         },
    //         {
    //           condition: 'default',
    //           label: 'NA',
    //         }
    //       ]
    //     },
    //     {
    //       display: 'Booking Dates',
    //       variable: 'slotBookingDetailsList[0].slotDate',
    //       filter: 'date',
    //       sort: true
    //     },
    //     {
    //       display: 'Payment Status',
    //       variable: 'slotBookingDetailsList[0].payment.paymentStatus',
    //       filter: 'text',
    //       sort: false,
    //       conditions: [
    //         {
    //           value: '1',
    //           condition: 'eq',
    //           label: 'Paid'
    //         },
    //         {
    //           condition: 'default',
    //           label: 'Unpaid',
    //         }
    //       ]
    //     },
    //     {
    //       display: 'Action',
    //       label: 'Mark Addressed',
    //       style: 'btn btn-danger width-100 mb-xs botton_txt done_txt',
    //       filter: 'action',
    //       type: 'button',
    //       event: 'markaddressedbutton',
    //       sort: false,
    //       variable: 'remarkStatus',
    //       conditions: [
    //         {
    //           value: '0',
    //           condition: 'lte',
    //           label: 'Mark Addressed',
    //           style: 'btn btn-danger width-100 mb-xs botton_txt done_txt'
    //         },
    //         {
    //           value: '1',
    //           condition: 'eq',
    //           label: 'Addressed',
    //           style: 'btn width-100 mb-xs   hide_btntxt'
    //         },
    //         {
    //           condition: 'default',
    //           label: 'Mark Addressed',
    //           style: 'btn btn-danger width-100 mb-xs botton_txt'
    //         }
    //       ]
    //     },
    //     {
    //       display: 'Actioned By',
    //       variable: 'employee.firstName employee.lastName',
    //       filler: ',',
    //       filter: 'nametitle',
    //       sort: false
    //     },
    //     {
    //       display: 'Remarks',
    //       variable: 'remark',
    //       filter: 'text',
    //       sort: false
    //     }
    //   ];

    //   sorting: any = {
    //     column: 'updatedTimestamp',
    //     descending: true
    //   };

    constructor(config: AppConfig,
        private spinnerService: SpinnerService, private saasService: saasSubscriptionsService) {


    }

    ngOnInit(): void {
        this.getCancelledOrders();
    }

    getCancelledOrders() {
        this.saasService.getCancelledSaasOrders('').then((response) => {
            console.log('cancelledorders', JSON.stringify(response));
        }).catch((err) => {
            console.log(err);
        })
    }

}
