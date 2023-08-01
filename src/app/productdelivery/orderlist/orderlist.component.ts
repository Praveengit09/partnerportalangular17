import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from './../../auth/auth.service';
import { HsLocalStorage } from './../../base/hsLocalStorage.service';
import { SpinnerService } from './../../layout/widget/spinner/spinner.service';
import { ProductDeliveryTrack } from './../../model/product/productdeliverytrack';
import { ProductDeliveryService } from './../productdelivery.service';


@Component({
    selector: 'orderlist',
    styleUrls: ['./orderlist.style.scss'],
    templateUrl: './orderlist.template.html',
    encapsulation: ViewEncapsulation.Emulated
})
export class DeliveryOrderListComponent implements OnInit {

    errorMessage: Array<string>;
    isError: boolean;
    showMessage: boolean;
    total = 0;
    perPage = 10;
    searchCriteria: string = '';
    orderList = new Array();
    selectedOrder: any = {};
    finalAmount: number = 0;

    deliveryType: any = null;
    columns: any[] = [
        {
            display: 'Order ID',
            variable: 'orderId',
            filter: 'text',
            sort: false
        },
        {
            display: 'Delivery Details',
            variable: `cartItem.patientProfileDetails.title cartItem.patientProfileDetails.fName 
                        cartItem.patientProfileDetails.lName, cartItem.patientProfileDetails.contactInfo.mobile, cartItem.deliveryAddress.label, cartItem.deliveryAddress.areaName, \n
                        cartItem.deliveryAddress.address1, cartItem.deliveryAddress.address2 \n
                        cartItem.deliveryAddress.cityName, cartItem.deliveryAddress.pinCode`,
            filter: 'nametitle',
            filler: ',',
            sort: false
        },
        {
            display: 'Pick up Address',
            variable: `cartItem.pocDetails.pocName \n cartItem.pocDetails.address.label, cartItem.pocDetails.address.areaName, \n
            cartItem.pocDetails.address.address1, cartItem.pocDetails.address.address2 \n
            cartItem.pocDetails.address.cityName, cartItem.pocDetails.address.pinCode`,
            filter: 'text',
            sort: false
        },
        {
            display: 'Status',
            variable: 'status',
            filter: 'text',
            sort: false,
        },
        {
            display: 'Delivery Time',
            variable: 'deliveryTime',
            filter: 'date',
            sort: false
        },
        {
            display: 'Action',
            label: 'View',
            style: 'btn btn-danger width-100 mb-xs botton_txtdigo done_txt',
            filter: 'action',
            type: 'button',
            event: 'viewButton',
            sort: false,
        }
    ]
    sorting: any = {
        // column: 'orderId',
        // descending: true
    };
    deliveryAvailableFor = ['pharmacy', 'product']
    productListType = '';
    actionStatus = ProductDeliveryTrack;
    displayList = [];
    timePeriod = 'present';

    constructor(private authService: AuthService, private activatedRoute: ActivatedRoute, private productDeliveryService: ProductDeliveryService,
        private router: Router, public spinner: SpinnerService, private hsLocalStorage: HsLocalStorage) {
        activatedRoute.params.subscribe((params) => {
            console.log(window.location.pathname);
            if ((params['type'] || params['type'] == 0) && !isNaN(params['type']) && this.deliveryAvailableFor.length > params['type']) {
                let typeIndex = params['type'];
                this.deliveryType = typeIndex;
                this.deliveryType = window.location.href.includes('app/' + this.deliveryAvailableFor[typeIndex]) ? this.deliveryType : 'error';
            } else { this.deliveryType = 'error'; }
            // if (params['type']) {
            //     this.deliveryType = this.deliveryAvailableFor.includes(params['type']) ? params['type'] : 'error';
            // }
            if (this.deliveryType != 'error') { productDeliveryService.setDeliveryType(this.deliveryType); }
        })
    }

    ngOnInit() {
        this.fetchDeliveryOrder();
        this.productListType = this.deliveryType == 1 ? 'productList' : 'pharmacyList';
        $(document).ready(() => {
            $("#viewOrderModal").on('hide.bs.modal', () => { setTimeout(() => { this.filterDisplayData(); }, 50); });
        });
    }

    fetchDeliveryOrder() {
        this.spinner.start();
        let reqBody = {
            "empId": this.authService.userAuth.employeeId,
            "pocIdList": [this.authService.userAuth.pocId],
            "portal": true,
            "orderRequest": this.deliveryType
        };
        this.productDeliveryService.getOrdersForDelivery(JSON.stringify(reqBody)).then(data => {
            console.log(data);
            this.orderList = data;
            this.filterDisplayData();
            this.spinner.stop();
        }).catch(err => {
            console.log(err);
            this.displayList = [];
            this.spinner.stop();
        })
    }
    filterDisplayData() {
        let type = this.timePeriod;
        let tDate = new Date();
        this.displayList = [];
        if (this.orderList && this.orderList.length) {
            let list = [...this.orderList];
            tDate.setHours(0, 0, 0, 0);
            if (type == 'present') {
                this.displayList = list.filter(ord => { return ord.deliveryTime == tDate.getTime(); });
            } else if (type == 'past') {
                this.displayList = list.filter(ord => { return ord.deliveryTime < tDate.getTime(); });
            } else if (type == 'future') {
                this.displayList = list.filter(ord => { return ord.deliveryTime > tDate.getTime(); });
            } else this.displayList = list;
            console.log(this.displayList);
            this.updateStatusForOrders();
        }
    }
    updateStatusForOrders() {
        this.displayList.forEach(e => {
            let paymentStatus = null, deliveryStatus = null;
            if (e.cartItem.payment) {
                paymentStatus = e.cartItem.payment.paymentStatus == 1 ? 'Paid' : e.cartItem.payment.paymentStatus == 0 ? 'Not Paid' :
                    e.cartItem.payment.paymentStatus == 2 ? 'Pending' : 'Pending';
            }
            deliveryStatus = e.actionStatus == 15 ? 'Initiated' : e.actionStatus == 13 ? 'Delivered' :
                e.actionStatus == 1 ? 'Delivered' :
                    e.actionStatus == 12 ? 'Out For Delivery' : e.actionStatus == 4 ? 'Rejected' :
                        e.actionStatus == 5 ? 'Cancelled' : e.actionStatus == 3 ? 'Not Initiated' : 'To Be Collected';
            e.status = `${paymentStatus ? `Payment: ${paymentStatus}, ` : ''}\n Delivery: ${deliveryStatus}`
        });
    }

    hasError() {
        return this.errorMessage.length;
    }

    getRefreshedorderList(search: string): void {
        (<any>$)("#orderId").prop("checked", true);
        this.orderList = new Array();
        this.total = 0;
        $('#search').val('');
        if (search != undefined && search.length < 1) {
            console.log("here SEARCH inside refresh" + search);
            this.fetchDeliveryOrder();
        }
    }
    clickEventHandler(e) {
        console.log(e);
        if (e.event == "viewButton") {
            this.selectedOrder = e.val;
            if (this.selectedOrder.cartItem.payment.paymentStatus)
                this.finalAmount = this.selectedOrder.cashPaymentAmount - this.selectedOrder.cartItem.payment.amountPaid;
            else
                this.finalAmount = this.selectedOrder.cashPaymentAmount;
            (<any>$('#viewOrderModal')).modal('show');
            //   this.onButtonClicked(e.val);
        }
    }
    updateDelivery(status = 0) {
        let index = this.orderList.findIndex(s => {
            return s.orderId == this.selectedOrder.orderId;
        })
        if (status == this.actionStatus.CUSTOMER_APPROVED) {
            this.deliveryServiceUpdate(this.actionStatus.DELIVERY_INITIATED, index);
        } else if (status == this.actionStatus.DELIVERY_INITIATED) {
            this.deliveryServiceUpdate(this.actionStatus.OUT_FOR_DELIVERY, index);
        } else if (status == this.actionStatus.OUT_FOR_DELIVERY && (!this.orderList[index].cashPaymentAmount ||
            (this.orderList[index].cashPaymentAmount && confirm('Collected Amount: ₹' + this.finalAmount + '?')))) {
            // letStatus = this.actionStatus.COMPLETED;
            this.deliveryServiceUpdate(this.actionStatus.COMPLETED, index);
        }

    }
    deliveryServiceUpdate(letStatus, i) {

        let reqBody = { ...this.selectedOrder };
        reqBody.actionStatus = letStatus;
        reqBody.orderRequest = this.deliveryType;
        this.spinner.start();
        this.productDeliveryService.updatehomeordersfordelivery(reqBody).then(data => {
            this.spinner.stop();
            this.selectedOrder = data;
            if (i != -1) {
                this.orderList[i].actionStatus = letStatus;
                // this.filterDisplayData();
            }
            if (this.actionStatus.COMPLETED == data.actionStatus) {
                (<any>$)('#viewOrderModal').modal('hide');
                alert('Delivered Successfully')
                this.getRefreshedorderList('');
            }
        }).catch(err => { this.spinner.stop(); })
    }
    onPage(page: number) {
        // this.getpharmacyAdvisesForPoc(this.total, '', '');
    }
}
