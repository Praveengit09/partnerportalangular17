import { Payment } from './../../model/basket/payment';
import { SlotDetail } from './../../model/slotbooking/slotdetails';

export class DiagnosticSlotDetail {

    public time: number;
    public status: number;
    public patientFirstName: string;
    public patientTitle: string;
    public patientLastName: string;
    public patientProfileId: number;
    public patientContactNumber: string;
    public patientDOB: number;
    public patientGender: string;
    public bookingId: string;
    public roomNumber: string;
    public payment: Payment;
    public orderId: string;
    public invoiceId: string;
    public parentProfileId: number;
    public serviceId: number;
    public expireTime: number;
    public pocId: number;
    public message: string;
    public isChecked: boolean;
    public slotStatusMessage;
    public isDisabled: boolean;
    public slotBookDetails: string;
    public bookingSubType: number;

    constructor(slotDetail: SlotDetail, selectedDate: number, todayDate: number) {
        this.expireTime = slotDetail.expireTime;
        let currentTime: Date = new Date();
        currentTime.setFullYear(1970, 0, 1);
        let timeNow: number = currentTime.getTime();

        this.time = slotDetail.time;
        this.status = slotDetail.status;
        switch (slotDetail.status) {
            case 0: {
                if ((slotDetail.expireTime > timeNow && selectedDate == todayDate) || selectedDate > todayDate) {
                    this.isDisabled = false;
                }
                else {
                    this.isDisabled = true;
                }
                break;
            }
            case 1: {
                if ((slotDetail.expireTime > timeNow && selectedDate == todayDate) || selectedDate > todayDate) {
                    this.isDisabled = false;
                }
                else {
                    this.isDisabled = true;
                }
                this.setPatientDetails(slotDetail);
                break;
            }
            case 2: {
                this.isDisabled = true;
                break;
            }
            case 3: {  //Short Block
                this.isDisabled = true; //When user is paying via online we are keeping slot disabled to pay from poc
                this.setPatientDetails(slotDetail);
                break;
            }
        }
        console.log("***slot" + JSON.stringify(slotDetail));
    }

    setPatientDetails(slotDetail: SlotDetail): void {
        this.patientProfileId = slotDetail.patientProfileId;
        this.patientTitle = slotDetail.patientTitle;
        this.patientFirstName = slotDetail.patientFirstName;
        this.patientTitle = slotDetail.patientTitle;
        this.patientLastName = slotDetail.patientLastName ? slotDetail.patientLastName : '';
        this.patientContactNumber = slotDetail.patientContactNumber;
        this.patientGender = slotDetail.patientGender;
        this.patientDOB = slotDetail.patientDOB;
        this.parentProfileId = slotDetail.parentProfileId;
        // this.patientContactNumber = slotDetail.patientContactNumber;
        this.bookingId = slotDetail.bookingId;
        this.roomNumber = slotDetail.roomNumber;
        this.payment = slotDetail.payment;
        this.orderId = slotDetail.orderId;
        this.invoiceId = slotDetail.invoiceId;
        this.bookingSubType = slotDetail.bookingSubType;
        this.parentProfileId = slotDetail.parentProfileId;
        this.serviceId = slotDetail.serviceId;
        if (slotDetail.patientGender != undefined) {
            this.message = slotDetail.patientGender.slice(0, 1);
        }

    }
}
