import { Component, ViewEncapsulation, OnInit, Input, OnChanges, Output, EventEmitter, SimpleChange } from '@angular/core';

@Component({
    selector: 'customer_review_modal',
    templateUrl: './customer_review_modal.template.html',
    styleUrls: ['./customer_review_modal.style.scss'],
    encapsulation: ViewEncapsulation.Emulated
})

export class CustomerReviewModalComponent implements OnInit {

    @Input() public modalTitle;
    @Input() public interactionStatus;
    @Input() public previousComments = '';
    @Input() public modalId;
    @Input() public checkDoctorBooking = false;
    @Input() public checkDiagnosticBooking = false;
    @Input() public hasTypeCheck = false;
    @Output() public addInteractionStatusEvent = new EventEmitter();
    @Output() public onRemarkSubmitEvent = new EventEmitter();
    @Output() public checkBookingTypeEvent = new EventEmitter();
    @Input() public errorMessage: string;
    interactionStatusList = ['Not Interacted', 'Interacted', 'Not Reachable', 'Abusive', 'Re-Interact']

    constructor() {

    }
    ngOnInit() {

    }
    ngOnChanges(changes: { [propKey: string]: SimpleChange }) {

        // if (this.first == true) {
        // if (changes['interactionStatus']) {
        //     changes['interactionStatus'].currentValue == null ? this.interactionStatus = this.interactionStatusList[0] : this.interactionStatus = changes['interactionStatus'].currentValue;
        // }

        //     if (changes['previousComments']) {
        //         changes['previousComments'].currentValue == null ? this.previousComments = ' ' : this.previousComments = changes['previousComments'].currentValue;
        //     }

        //     if (changes['checkDoctorBooking']) {
        //         changes['checkDoctorBooking'].currentValue == null ? this.checkDoctorBooking = false : this.checkDoctorBooking = changes['checkDoctorBooking'].currentValue;
        //     }

        //     if (changes['checkDiagnosticBooking']) {
        //         changes['checkDiagnosticBooking'].currentValue == null ? this.checkDiagnosticBooking = false : this.checkDiagnosticBooking = changes['checkDiagnosticBooking'].currentValue;
        //     }
        // }
        // else {
        //     if (changes['checkDoctorBooking']) {
        //         this.checkDoctorBooking = changes['checkDoctorBooking'].currentValue
        //     }
        //     if (changes['checkDiagnosticBooking']) {
        //         this.checkDiagnosticBooking = changes['checkDiagnosticBooking'].currentValue
        //     }

        // }



    }
    addInteractionStatus(status: any) {
        this.addInteractionStatusEvent.emit(status);

    }
    onSubmit(remark: any) {
        this.onRemarkSubmitEvent.emit(remark);
    }

    onCheckType(value: any) {
        this.checkBookingTypeEvent.emit(value)
    }
    clear() {
        this.interactionStatus = '';
        this.previousComments = '';
        this.errorMessage = '';
    }

    ngOnDestroy(): void {
        this.interactionStatus = '';
        this.previousComments = '';
    }

}